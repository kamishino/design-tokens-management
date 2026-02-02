/**
 * Prepends a new font family to an existing CSS font-family stack.
 * Ensures the new font is first and no duplicates exist.
 */
export const prependFont = (newFont: string, existingStack: string): string => {
  if (!existingStack) return newFont;

  // Clean and split the existing stack
  const fonts = existingStack.split(',').map(f => f.trim());
  
  // Format the new font (add quotes if contains spaces)
  const formattedNewFont = newFont.includes(' ') && !newFont.startsWith('"') 
    ? `"${newFont}"` 
    : newFont;

  // Remove existing occurrence of this font (handling both quoted and unquoted versions)
  const filteredFonts = fonts.filter(f => {
    const cleanF = f.replace(/^["']|["']$/g, '');
    const cleanNew = newFont.replace(/^["']|["']$/g, '');
    return cleanF.toLowerCase() !== cleanNew.toLowerCase();
  });

  return [formattedNewFont, ...filteredFonts].join(', ');
};
