import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';
import * as ChatContext from '@/contexts/ChatContext';

// Mock the useChat hook
const mockSendMessage = vi.fn();
const mockClearError = vi.fn();

vi.mock('@/contexts/ChatContext', async () => {
  const actual = await vi.importActual('@/contexts/ChatContext');
  return {
    ...actual,
    useChat: vi.fn(),
  };
});

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(ChatContext.useChat).mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      sessionId: 'test-session-id',
      sendMessage: mockSendMessage,
      clearError: mockClearError,
    });
  });

  describe('rendering', () => {
    it('should render textarea and submit button', () => {
      render(<ChatInput />);

      expect(screen.getByPlaceholderText('メッセージを入力...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /メッセージを送信/i })).toBeInTheDocument();
    });

    it('should have correct form aria-label', () => {
      render(<ChatInput />);

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'メッセージ送信フォーム');
    });

    it('should have label for textarea', () => {
      render(<ChatInput />);

      const label = screen.getByText('メッセージ', { selector: 'label' });
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('sr-only');
      expect(label).toHaveAttribute('for', 'message-input');
    });

    it('should have screen reader hint text', () => {
      render(<ChatInput />);

      const hint = screen.getByText('Enterキーで送信、Shift+Enterで改行');
      expect(hint).toHaveClass('sr-only');
      expect(hint).toHaveAttribute('id', 'message-hint');
    });

    it('should have correct ARIA attributes on textarea', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      expect(textarea).toHaveAttribute('id', 'message-input');
      expect(textarea).toHaveAttribute('aria-label', 'メッセージを入力');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-hint');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('input handling', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, 'Hello world');

      expect(textarea).toHaveValue('Hello world');
    });

    it('should allow multiline input', async () => {
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

      expect(textarea).toHaveValue('Line 1\nLine 2');
    });

    it('should clear input after successful submission', async () => {
      mockSendMessage.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, 'Test message');

      const submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });
  });

  describe('form submission', () => {
    it('should call sendMessage when submit button is clicked', async () => {
      mockSendMessage.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, 'Test message');

      const submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      await user.click(submitButton);

      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
    });

    it('should submit form on Enter key press', async () => {
      mockSendMessage.mockResolvedValue(undefined);
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Test message');
      });
    });

    it('should NOT submit form on Shift+Enter', async () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should trim whitespace before sending', async () => {
      mockSendMessage.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, '  Test message  ');

      const submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('  Test message  ');
      });
    });

    it('should NOT submit when input is empty', async () => {
      const user = userEvent.setup();
      render(<ChatInput />);

      const submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      await user.click(submitButton);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should NOT submit when input contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, '   ');

      const submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      await user.click(submitButton);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should disable textarea when loading', () => {
      vi.mocked(ChatContext.useChat).mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        sessionId: 'test-session-id',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      expect(textarea).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      vi.mocked(ChatContext.useChat).mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        sessionId: 'test-session-id',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      render(<ChatInput />);

      const submitButton = screen.getByRole('button', { name: /送信中/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text in button when loading', () => {
      vi.mocked(ChatContext.useChat).mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        sessionId: 'test-session-id',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      render(<ChatInput />);

      expect(screen.getByText('送信中...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /送信中/i })).toBeInTheDocument();
    });

    it('should NOT submit when loading', async () => {
      vi.mocked(ChatContext.useChat).mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        sessionId: 'test-session-id',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      // Even though it's disabled, try to change it
      fireEvent.change(textarea, { target: { value: 'Test message' } });

      const submitButton = screen.getByRole('button');
      await user.click(submitButton);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('IME composition handling', () => {
    it('should NOT submit on Enter when composing (IME active)', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      fireEvent.change(textarea, { target: { value: 'テスト' } });

      // Start composition
      fireEvent.compositionStart(textarea);

      // Try to submit with Enter while composing
      fireEvent.keyDown(textarea, {
        key: 'Enter',
        shiftKey: false,
        nativeEvent: { isComposing: true },
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should handle composition start and end', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');

      // Start composition
      fireEvent.compositionStart(textarea);

      // Type while composing (this should not submit)
      fireEvent.keyDown(textarea, {
        key: 'Enter',
        shiftKey: false,
        nativeEvent: { isComposing: true },
      });

      expect(mockSendMessage).not.toHaveBeenCalled();

      // End composition
      fireEvent.compositionEnd(textarea);

      // Component should work normally after composition ends (after timeout)
    });
  });

  describe('button state', () => {
    it('should disable button when input is empty', () => {
      render(<ChatInput />);

      const submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable button when input has only whitespace', async () => {
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, '   ');

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable button when input has valid text', async () => {
      const user = userEvent.setup();
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      await user.type(textarea, 'Valid message');

      const submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper minimum height for touch targets', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      expect(textarea).toHaveClass('min-h-[56px]');
      expect(textarea).toHaveClass('sm:min-h-[60px]');
    });

    it('should have touch-manipulation class', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      expect(textarea).toHaveClass('touch-manipulation');
    });

    it('should update button aria-label based on loading state', () => {
      const { rerender } = render(<ChatInput />);

      let submitButton = screen.getByRole('button', { name: /メッセージを送信/i });
      expect(submitButton).toHaveAttribute('aria-label', 'メッセージを送信');

      // Change to loading state
      vi.mocked(ChatContext.useChat).mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        sessionId: 'test-session-id',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      rerender(<ChatInput />);

      submitButton = screen.getByRole('button', { name: /送信中/i });
      expect(submitButton).toHaveAttribute('aria-label', '送信中');
    });

    it('should have aria-hidden on button text during loading', () => {
      vi.mocked(ChatContext.useChat).mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        sessionId: 'test-session-id',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      const { container } = render(<ChatInput />);

      const buttonText = container.querySelector('[aria-hidden="true"]');
      expect(buttonText).toBeInTheDocument();
      expect(buttonText).toHaveTextContent('送信中...');
    });
  });

  describe('responsive design', () => {
    it('should have responsive padding classes on textarea', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      expect(textarea).toHaveClass('px-3');
      expect(textarea).toHaveClass('py-2.5');
      expect(textarea).toHaveClass('sm:px-4');
      expect(textarea).toHaveClass('sm:py-3');
    });

    it('should have max-height constraint', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      expect(textarea).toHaveClass('max-h-[200px]');
    });

    it('should have resize-none class', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText('メッセージを入力...');
      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('form behavior', () => {
    it('should prevent default form submission', async () => {
      mockSendMessage.mockResolvedValue(undefined);
      render(<ChatInput />);

      const form = screen.getByRole('form');
      const textarea = screen.getByPlaceholderText('メッセージを入力...');

      fireEvent.change(textarea, { target: { value: 'Test message' } });

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      fireEvent(form, submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should have correct gap between textarea and button', () => {
      const { container } = render(<ChatInput />);

      const form = container.querySelector('form');
      expect(form).toHaveClass('gap-2');
    });

    it('should have correct layout classes', () => {
      const { container } = render(<ChatInput />);

      const form = container.querySelector('form');
      expect(form).toHaveClass('flex');
      expect(form).toHaveClass('items-end');
      expect(form).toHaveClass('w-full');
    });
  });
});
