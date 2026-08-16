import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for template management (save, load, delete templates)
 */
export const useTemplates = ({ pages, setPages, setCurrentPageIndex, saveToHistory }) => {
  const { toast } = useToast();
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Load saved templates from localStorage
  useEffect(() => {
    const templates = localStorage.getItem('bfm_saved_templates');
    if (templates) {
      setSavedTemplates(JSON.parse(templates));
    }
  }, []);
  
  // Save current magazine as a reusable template
  const saveAsTemplate = useCallback(() => {
    if (!templateName.trim()) {
      toast({ title: "Please enter a template name", variant: "destructive" });
      return;
    }
    
    const newTemplate = {
      id: `template_${Date.now()}`,
      name: templateName.trim(),
      pages: JSON.parse(JSON.stringify(pages)),
      createdAt: new Date().toISOString(),
      pageCount: pages.length
    };
    
    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('bfm_saved_templates', JSON.stringify(updatedTemplates));
    
    setTemplateName('');
    setShowSaveTemplateModal(false);
    toast({ title: "Template saved!", description: `"${newTemplate.name}" is now available for new magazines` });
  }, [templateName, pages, savedTemplates, toast]);
  
  // Load a saved template
  const loadTemplate = useCallback((template) => {
    setPages(JSON.parse(JSON.stringify(template.pages)));
    setCurrentPageIndex(0);
    saveToHistory(template.pages);
    toast({ title: "Template loaded", description: `Loaded "${template.name}"` });
  }, [setPages, setCurrentPageIndex, saveToHistory, toast]);
  
  // Delete a saved template
  const deleteTemplate = useCallback((templateId) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('bfm_saved_templates', JSON.stringify(updatedTemplates));
    toast({ title: "Template deleted" });
  }, [savedTemplates, toast]);
  
  return {
    savedTemplates,
    showSaveTemplateModal,
    setShowSaveTemplateModal,
    templateName,
    setTemplateName,
    saveAsTemplate,
    loadTemplate,
    deleteTemplate
  };
};

export default useTemplates;
