import React from 'react';
import { Streamdown } from 'streamdown';

interface MessageMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

export const MessageMarkdown: React.FC<MessageMarkdownProps> = ({ content, isStreaming = false }) => {
  return (
    <div className={`minesetu-markdown-container ${isStreaming ? 'is-streaming' : ''}`}>
      <Streamdown>
        {content}
      </Streamdown>
    </div>
  );
};
