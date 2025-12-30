import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';
import type { Message } from '@/types/chat';

describe('ChatMessage', () => {
  const baseMessage: Message = {
    id: '1',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Hello, this is a test message',
    createdAt: new Date('2024-01-15T10:30:00Z'), // Use Z for UTC
  };

  describe('user messages', () => {
    it('should render user message with correct content', () => {
      render(<ChatMessage message={baseMessage} />);

      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });

    it('should have correct ARIA label for user message', () => {
      render(<ChatMessage message={baseMessage} />);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'あなたのメッセージ');
    });

    it('should have screen reader text for user role', () => {
      render(<ChatMessage message={baseMessage} />);

      const srOnlyText = screen.getByText('あなた:', { exact: false });
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('should display user message with primary background styling', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const messageBox = container.querySelector('.bg-primary');
      expect(messageBox).toBeInTheDocument();
      expect(messageBox).toHaveClass('text-primary-foreground');
    });

    it('should align user message to the right', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('justify-end');
    });

    it('should format timestamp correctly for user message', () => {
      render(<ChatMessage message={baseMessage} />);

      const timeElement = document.querySelector('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('datetime', '2024-01-15T10:30:00.000Z');
      // Verify time is displayed in HH:MM format (locale-dependent actual value)
      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('AI messages', () => {
    const aiMessage: Message = {
      ...baseMessage,
      role: 'assistant',
      content: 'This is an AI response',
    };

    it('should render AI message with correct content', () => {
      render(<ChatMessage message={aiMessage} />);

      expect(screen.getByText('This is an AI response')).toBeInTheDocument();
    });

    it('should have correct ARIA label for AI message', () => {
      render(<ChatMessage message={aiMessage} />);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'AIのメッセージ');
    });

    it('should have screen reader text for AI role', () => {
      render(<ChatMessage message={aiMessage} />);

      const srOnlyText = screen.getByText('AI:', { exact: false });
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('should display AI message with muted background styling', () => {
      const { container } = render(<ChatMessage message={aiMessage} />);

      const messageBox = container.querySelector('.bg-muted');
      expect(messageBox).toBeInTheDocument();
      expect(messageBox).toHaveClass('text-foreground');
      expect(messageBox).toHaveClass('border');
      expect(messageBox).toHaveClass('border-border');
    });

    it('should align AI message to the left', () => {
      const { container } = render(<ChatMessage message={aiMessage} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('justify-start');
    });

    it('should format timestamp correctly for AI message', () => {
      render(<ChatMessage message={aiMessage} />);

      const timeElement = document.querySelector('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('datetime', '2024-01-15T10:30:00.000Z');
      // Verify time is displayed in HH:MM format (locale-dependent actual value)
      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('message formatting', () => {
    it('should preserve whitespace and line breaks', () => {
      const messageWithLineBreaks: Message = {
        ...baseMessage,
        content: 'Line 1\nLine 2\nLine 3',
      };

      const { container } = render(<ChatMessage message={messageWithLineBreaks} />);

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      // Check that the paragraph has the classes needed to preserve whitespace
      expect(paragraph).toHaveClass('whitespace-pre-wrap');
      expect(paragraph).toHaveClass('break-words');
      // Verify the content is rendered (toHaveTextContent normalizes whitespace, so check for all lines)
      expect(paragraph).toHaveTextContent('Line 1');
      expect(paragraph).toHaveTextContent('Line 2');
      expect(paragraph).toHaveTextContent('Line 3');
    });

    it('should handle long messages with word breaking', () => {
      const longMessage: Message = {
        ...baseMessage,
        content: 'a'.repeat(1000),
      };

      const { container } = render(<ChatMessage message={longMessage} />);

      const paragraph = container.querySelector('.break-words');
      expect(paragraph).toBeInTheDocument();
    });

    it('should handle empty message content', () => {
      const emptyMessage: Message = {
        ...baseMessage,
        content: '',
      };

      const { container } = render(<ChatMessage message={emptyMessage} />);

      // Component should still render even with empty content
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should have responsive max-width classes', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const messageBox = container.querySelector('.max-w-\\[85\\%\\]');
      expect(messageBox).toBeInTheDocument();
      expect(messageBox).toHaveClass('sm:max-w-[80%]');
    });

    it('should have responsive padding classes', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const messageBox = container.querySelector('.px-3');
      expect(messageBox).toBeInTheDocument();
      expect(messageBox).toHaveClass('py-2.5');
      expect(messageBox).toHaveClass('sm:px-4');
      expect(messageBox).toHaveClass('sm:py-3');
    });

    it('should have responsive margin classes', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('mb-3');
      expect(wrapper).toHaveClass('sm:mb-4');
    });

    it('should have responsive text size classes', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const paragraph = container.querySelector('.text-sm');
      expect(paragraph).toHaveClass('sm:text-base');
    });

    it('should have responsive gap classes', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const flexContainer = container.querySelector('.gap-2');
      expect(flexContainer).toHaveClass('sm:gap-3');
    });
  });

  describe('animations', () => {
    it('should have animation classes', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('animate-in');
      expect(wrapper).toHaveClass('fade-in');
      expect(wrapper).toHaveClass('slide-in-from-bottom-2');
      expect(wrapper).toHaveClass('duration-300');
    });
  });

  describe('timestamp formatting', () => {
    it('should format morning time correctly', () => {
      const morningMessage: Message = {
        ...baseMessage,
        createdAt: new Date('2024-01-15T09:05:00Z'),
      };

      render(<ChatMessage message={morningMessage} />);

      const timeElement = document.querySelector('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('datetime', '2024-01-15T09:05:00.000Z');
      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format afternoon time correctly', () => {
      const afternoonMessage: Message = {
        ...baseMessage,
        createdAt: new Date('2024-01-15T15:45:00Z'),
      };

      render(<ChatMessage message={afternoonMessage} />);

      const timeElement = document.querySelector('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('datetime', '2024-01-15T15:45:00.000Z');
      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format midnight time correctly', () => {
      const midnightMessage: Message = {
        ...baseMessage,
        createdAt: new Date('2024-01-15T00:00:00Z'),
      };

      render(<ChatMessage message={midnightMessage} />);

      const timeElement = document.querySelector('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('datetime', '2024-01-15T00:00:00.000Z');
      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should have ISO 8601 datetime attribute', () => {
      render(<ChatMessage message={baseMessage} />);

      const timeElement = document.querySelector('time');
      const dateTimeAttr = timeElement?.getAttribute('datetime');

      expect(dateTimeAttr).toBeTruthy();
      // Verify it's a valid ISO 8601 format
      expect(new Date(dateTimeAttr!).toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('isLatest prop', () => {
    it('should render correctly when isLatest is true', () => {
      render(<ChatMessage message={baseMessage} isLatest={true} />);

      // Component should render normally, isLatest doesn't affect rendering currently
      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });

    it('should render correctly when isLatest is false', () => {
      render(<ChatMessage message={baseMessage} isLatest={false} />);

      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });

    it('should render correctly when isLatest is not provided', () => {
      render(<ChatMessage message={baseMessage} />);

      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });
  });

  describe('semantic HTML', () => {
    it('should use article role for message container', () => {
      render(<ChatMessage message={baseMessage} />);

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('should use time element for timestamp', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const timeElements = container.querySelectorAll('time');
      expect(timeElements).toHaveLength(1);
    });

    it('should use paragraph element for message content', () => {
      const { container } = render(<ChatMessage message={baseMessage} />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0]).toHaveTextContent('Hello, this is a test message');
    });
  });
});
