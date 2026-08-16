import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts in the Magazine Editor
 */
export const useEditorShortcuts = ({
  step,
  selectedElement,
  undo,
  redo,
  copyElement,
  pasteElement,
  duplicateElement,
  deleteElement,
  saveMagazine,
  addElement,
  setSelectedElement,
  setShowQuickAddPanel
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when in editor (step 5)
      if (step !== 5) return;
      
      // Don't handle if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'c':
            e.preventDefault();
            copyElement();
            break;
          case 'v':
            e.preventDefault();
            pasteElement();
            break;
          case 'd':
            e.preventDefault();
            duplicateElement();
            break;
          case 's':
            e.preventDefault();
            saveMagazine(false);
            break;
          default:
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedElement) {
              e.preventDefault();
              deleteElement(selectedElement);
            }
            break;
          case 't':
          case 'T':
            e.preventDefault();
            addElement('text');
            break;
          case 'Escape':
            setSelectedElement(null);
            setShowQuickAddPanel(false);
            break;
          default:
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, selectedElement, undo, redo, copyElement, pasteElement, duplicateElement, deleteElement, saveMagazine, addElement, setSelectedElement, setShowQuickAddPanel]);
};

export default useEditorShortcuts;
