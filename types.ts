
export enum LayoutType {
  HERO = 'HERO',
  FEATURES = 'FEATURES',
  CONTENT_IMAGE = 'CONTENT_IMAGE',
  GRID = 'GRID',
  CONTACT = 'CONTACT',
  PRICING = 'PRICING',
  BLANK = 'BLANK',
  CUSTOM = 'CUSTOM'
}

export enum ElementType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  GIF = 'GIF',
  BUTTON = 'BUTTON',
  LINK = 'LINK',
  TABLE = 'TABLE',
  SHAPE = 'SHAPE'
}

export type AnimationType = 'none' | 'fade' | 'slideUp' | 'slideDown' | 'zoomIn' | 'bounce' | 'flyInLeft' | 'flyInRight';
export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'flip';

export interface NavigationLink {
  id: string;
  label: string;
  targetSlideId?: string;
  url?: string;
  children?: NavigationLink[]; 
}

export interface SlideElement {
  id: string;
  type: ElementType;
  content: string; 
  name?: string; 
  groupId?: string; 
  styles?: {
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    lineHeight?: string;
    letterSpacing?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    marginTop?: string;
    width?: string;
    height?: string;
    left?: string; 
    top?: string;  
    borderRadius?: string;
    zIndex?: number;
    animation?: AnimationType;
    animationDelay?: string;
    boxShadow?: string;
    opacity?: string;
    padding?: string;
    gradient?: string;
    hidden?: boolean;
    textShadow?: string; 
    textStroke?: string;
    rotation?: string; 
    rotateX?: string; 
    rotateY?: string; 
    filter?: string; 
  };
  metadata?: any; 
}

export interface SlideContent {
  id: string;
  title: string;
  notes?: string;
  layout: LayoutType;
  elements: SlideElement[];
  transition?: TransitionType;
  section?: string; 
  styles?: {
    backgroundColor?: string;
    backgroundImage?: string;
    padding?: string;
    titleFontSize?: string;
    titleColor?: string;
    titleTextAlign?: 'left' | 'center' | 'right';
    titleFontWeight?: string;
    gradient?: string;
  };
}

export interface SiteProject {
  name: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    navbarEnabled: boolean;
    navLinks: NavigationLink[];
  };
  slides: SlideContent[];
}
