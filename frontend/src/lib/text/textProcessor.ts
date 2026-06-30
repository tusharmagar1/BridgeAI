/**
 * Utility to process text before sending to TTS engine.
 */

export const processTextForTTS = (text: string, options?: { skipCode?: boolean }): string => {
  if (!text) return "";
  
  let processed = text;

  if (options?.skipCode) {
    // Remove code blocks
    processed = processed.replace(/```[\s\S]*?```/g, "Code block skipped.");
  } else {
    // Make code blocks readable
    processed = processed.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `Here is a ${lang ? lang : 'code'} block. ${code}`;
    });
  }

  // Remove bold, italic, strikethrough markdown
  processed = processed.replace(/(\*\*|__)(.*?)\1/g, "$2");
  processed = processed.replace(/(\*|_)(.*?)\1/g, "$2");
  processed = processed.replace(/(~~)(.*?)\1/g, "$2");

  // Format headers to sound like breaks
  processed = processed.replace(/^#{1,6}\s+(.*)$/gm, "$1. ");

  // Remove links but keep text
  processed = processed.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Clean HTML
  processed = processed.replace(/<[^>]*>?/gm, "");

  // Remove empty lines and normalize spaces
  processed = processed.replace(/\n\s*\n/g, ". ");
  processed = processed.replace(/\s+/g, " ");

  return processed.trim();
};
