interface SummaryDisplayProps {
  summary: string;
  summaryId: string;
  highlights: Array<{ id: string; text: string; errorType: string; color: string; summaryId: string }>;
  selectedErrorType: string | null;
  onHighlight: (
    text: string, 
    errorType: string, 
    color: string, 
    updatedHighlights?: Array<{ id: string; text: string; errorType: string; color: string; summaryId: string }>
  ) => void;
}

// Update errorTypes constant to match the one in page.tsx
const errorTypes = [
  { name: 'Incorrect Definitions', color: '#FFB6B6' },
  { name: 'Incorrect Synonyms', color: '#BAFFC9' },
  { name: 'Incorrect Background', color: '#BAE1FF' },
  { name: 'Entity errors', color: '#FFE4BA' },
  { name: 'Contradiction', color: '#F8BAFF' },
  { name: 'Omission', color: '#FFFBA1' },
  { name: 'Jumping to Conclusions', color: '#FFD1DC' },
  { name: 'Misinterpretation', color: '#D4A5A5' }
];

export default function SummaryDisplay({ 
  summary, 
  summaryId,
  highlights, 
  selectedErrorType, 
  onHighlight 
}: SummaryDisplayProps) {
  const handleMouseUp = () => {
    if (!selectedErrorType) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Find the color for the selected error type
    const errorType = errorTypes.find(et => et.name === selectedErrorType);
    if (!errorType) return;

    // Get the selection range
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    const parentElement = range.startContainer.parentElement;
    if (!parentElement) return;
    preSelectionRange.selectNodeContents(parentElement);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    // Check if this exact text instance is already highlighted
    const existingHighlight = highlights.find(h => 
      h.text === selectedText && 
      h.summaryId === summaryId &&
      summary.indexOf(h.text, Math.max(0, start - h.text.length)) === start
    );

    if (existingHighlight) {
      // If it exists as an exact match, update the highlight
      const updatedHighlights = highlights.map(h => 
        h.id === existingHighlight.id
          ? { ...h, errorType: selectedErrorType, color: errorType.color }
          : h
      );
      onHighlight(selectedText, selectedErrorType, errorType.color, updatedHighlights);
    } else {
      // Always create a new highlight
      onHighlight(selectedText, selectedErrorType, errorType.color);
    }
    
    selection.removeAllRanges();
  };

  // Function to render text with highlights
  const renderHighlightedText = () => {
    let lastIndex = 0;
    const elements = [];
    const textContent = summary;
    
    // Sort highlights by position and then by length (shorter first)
    const sortedHighlights = [...highlights].sort((a, b) => {
      const posA = textContent.indexOf(a.text);
      const posB = textContent.indexOf(b.text);
      if (posA === posB) {
        return a.text.length - b.text.length; // Shorter highlights first when positions are equal
      }
      return posA - posB;
    });

    for (let i = 0; i < sortedHighlights.length; i++) {
      const highlight = sortedHighlights[i];
      const currentIndex = textContent.indexOf(highlight.text, lastIndex);
      
      if (currentIndex === -1) continue;

      // Add text before highlight
      if (currentIndex > lastIndex) {
        elements.push(textContent.slice(lastIndex, currentIndex));
      }

      // Add highlighted text
      elements.push(
        <span
          key={highlight.id}
          style={{ backgroundColor: highlight.color }}
          className="rounded px-1"
        >
          {highlight.text}
        </span>
      );

      lastIndex = currentIndex + highlight.text.length;
    }

    // Add remaining text
    if (lastIndex < textContent.length) {
      elements.push(textContent.slice(lastIndex));
    }

    return elements;
  };

  return (
    <div 
      onMouseUp={handleMouseUp}
      className="prose max-w-none"
    >
      {renderHighlightedText()}
    </div>
  );
}

