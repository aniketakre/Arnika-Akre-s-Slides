
import { GoogleGenAI, Type } from "@google/genai";
import { SiteProject, LayoutType, ElementType, SlideContent } from "../types";

export const generateSiteStructure = async (documentText: string, fileName: string): Promise<SiteProject> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', 
    contents: `You are a world-class presentation designer. 
    Analyze this document and transform it into a stunning 6-slide interactive web-style story.
    
    DOCUMENT: "${fileName}"
    CONTENT: ${documentText.substring(0, 10000)}

    CRITICAL RULES:
    1. IDs: Use unique strings like "slide_0", "el_0_1".
    2. Variety: Use HERO, FEATURES, GRID, and CONTENT_IMAGE layouts.
    3. Visuals: Use source.unsplash.com/random/1200x800?<topic> for images.
    4. Text: Keep it concise and impactful.
    5. NavLinks: Generate 3 top-level navigation links pointing to key slides.
    `,
    config: {
      thinkingConfig: { thinkingBudget: 0 }, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          theme: {
            type: Type.OBJECT,
            properties: {
              primaryColor: { type: Type.STRING },
              fontFamily: { type: Type.STRING },
              navbarEnabled: { type: Type.BOOLEAN },
              navLinks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    targetSlideId: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["primaryColor", "fontFamily"]
          },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                section: { type: Type.STRING },
                layout: { type: Type.STRING, enum: Object.values(LayoutType) },
                elements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING, enum: Object.values(ElementType) },
                      content: { type: Type.STRING },
                      styles: {
                        type: Type.OBJECT,
                        properties: {
                          fontSize: { type: Type.STRING },
                          left: { type: Type.STRING },
                          top: { type: Type.STRING },
                          width: { type: Type.STRING },
                          color: { type: Type.STRING }
                        }
                      }
                    },
                    required: ["id", "type", "content"]
                  }
                }
              },
              required: ["id", "title", "elements"]
            }
          }
        },
        required: ["name", "theme", "slides"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI response was empty.");

  try {
    const project = JSON.parse(text.trim()) as SiteProject;
    if (!project.theme.navLinks) project.theme.navLinks = [];
    return project;
  } catch (error) {
    throw new Error("Failed to parse AI structure. Please retry.");
  }
};

export const refineSlide = async (slide: SlideContent, primaryColor: string): Promise<SlideContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Redesign this slide layout for a high-end web experience. Use modern spacing, z-index layering, and bold typography.
    
    SLIDE DATA: ${JSON.stringify(slide)}
    THEME COLOR: ${primaryColor}

    Positioning must be in % strings. Ensure IDs remain consistent.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          layout: { type: Type.STRING, enum: Object.values(LayoutType) },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: Object.values(ElementType) },
                content: { type: Type.STRING },
                styles: { 
                  type: Type.OBJECT,
                  properties: {
                    fontSize: { type: Type.STRING },
                    fontWeight: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    color: { type: Type.STRING },
                    backgroundColor: { type: Type.STRING },
                    left: { type: Type.STRING },
                    top: { type: Type.STRING },
                    width: { type: Type.STRING },
                    height: { type: Type.STRING },
                    borderRadius: { type: Type.STRING },
                    zIndex: { type: Type.NUMBER },
                    textAlign: { type: Type.STRING }
                  }
                }
              },
              required: ["id", "type", "content"]
            }
          }
        },
        required: ["id", "title", "elements"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI refinement response was empty.");

  return JSON.parse(text.trim()) as SlideContent;
};

export const generateAiImage = async (prompt: string, aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" = "1:1"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from AI.");
};
