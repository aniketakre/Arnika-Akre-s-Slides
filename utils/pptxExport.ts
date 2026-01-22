
import pptxgen from "pptxgenjs";
import { SiteProject, ElementType } from "../types";

export const exportToPptx = async (project: SiteProject) => {
  const pres = new pptxgen();
  pres.title = project.name || 'Presentation';

  if (!project.slides) return;

  project.slides.forEach((slideData) => {
    const slide = pres.addSlide();
    
    if (slideData.styles?.backgroundColor) {
      slide.background = { fill: slideData.styles.backgroundColor.replace('#', '') };
    }

    if (slideData.elements) {
      slideData.elements.forEach((el) => {
        const textAlign = el.styles?.textAlign || 'center';
        const color = (el.styles?.color || '#333333').replace('#', '');
        const fontSize = parseFloat(el.styles?.fontSize || '1') * 24;

        // Convert percentage positioning back to slide inches (approx 10x5.6)
        const leftPercent = parseFloat(el.styles?.left || '10') / 100;
        const topPercent = parseFloat(el.styles?.top || '20') / 100;
        
        const xPos = 10 * leftPercent;
        const yPos = 5.6 * topPercent;

        switch (el.type) {
          case ElementType.TEXT:
          case ElementType.LINK:
            slide.addText(el.content || '', {
              x: xPos, y: yPos, w: 4,
              fontSize: fontSize, color: color,
              align: textAlign as any,
              hyperlink: el.type === ElementType.LINK ? { url: el.metadata?.href || 'https://google.com' } : undefined
            });
            break;

          case ElementType.IMAGE:
          case ElementType.GIF:
            if (el.content) {
              slide.addImage({
                path: el.content,
                x: xPos, y: yPos, w: 3, h: 2
              });
            }
            break;

          case ElementType.BUTTON:
            slide.addText(el.content || '', {
              x: xPos, y: yPos, w: 2, h: 0.5,
              fill: { color: (project.theme?.primaryColor || '#4f46e5').replace('#', '') },
              color: 'FFFFFF', align: 'center', valign: 'middle',
              shape: pres.ShapeType.roundRect
            });
            break;
        }
      });
    }
  });

  pres.writeFile({ fileName: `${(project.name || 'presentation').toLowerCase()}.pptx` });
};
