
export const readFileAsText = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'txt' || extension === 'md' || extension === 'json') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // High-performance mock extraction for demo purposes
  // Removed artificial delay for world-class speed
  return new Promise((resolve) => {
    const mockContent = `
DOCUMENT EXTRACTION: ${file.name}
TYPE: ${extension?.toUpperCase()} Document

[SUMMARY]
Strategic roadmap for digital transformation and platform scaling.

[SECTION: CORE VISION]
Enable high-fidelity document-to-web transitions using generative AI and glassmorphic UI components.

[SECTION: KEY FEATURES]
1. Real-time AI design refinement
2. Interactive spatial layouts
3. One-click global theming
4. Professional PPTX/PDF export

[SECTION: MARKET GAP]
Current tools offer static slides; users demand interactive, responsive web-based stories.

[SECTION: CONCLUSION]
Arnika Akre is the bridge between traditional documentation and modern storytelling.
    `;
    resolve(mockContent);
  });
};
