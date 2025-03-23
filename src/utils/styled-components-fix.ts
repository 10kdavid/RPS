import styled from 'styled-components';

// Define commonly used props interfaces
export interface WithCollapsed {
  collapsed: boolean;
}

export interface WithActive {
  active: boolean;
}

export interface WithIsOpen {
  isOpen: boolean;
}

export interface WithRevealed {
  revealed: boolean;
  hasMine?: boolean;
  isAnimating: boolean;
}

// Create styled components helpers with proper typing
export const styledButton = {
  withCollapsed: <P extends {}>(styles: TemplateStringsArray, ...args: any[]) => 
    styled.button.withConfig({
      shouldForwardProp: (prop) => prop !== 'collapsed'
    })<P & WithCollapsed>(styles, ...args),
    
  withIsOpen: <P extends {}>(styles: TemplateStringsArray, ...args: any[]) => 
    styled.button.withConfig({
      shouldForwardProp: (prop) => prop !== 'isOpen'
    })<P & WithIsOpen>(styles, ...args),
    
  withActive: <P extends {}>(styles: TemplateStringsArray, ...args: any[]) => 
    styled.button.withConfig({
      shouldForwardProp: (prop) => prop !== 'active'
    })<P & WithActive>(styles, ...args),
};

export const styledDiv = {
  withCollapsed: <P extends {}>(styles: TemplateStringsArray, ...args: any[]) => 
    styled.div.withConfig({
      shouldForwardProp: (prop) => prop !== 'collapsed'
    })<P & WithCollapsed>(styles, ...args),
    
  withIsOpen: <P extends {}>(styles: TemplateStringsArray, ...args: any[]) => 
    styled.div.withConfig({
      shouldForwardProp: (prop) => prop !== 'isOpen'
    })<P & WithIsOpen>(styles, ...args),
    
  withActive: <P extends {}>(styles: TemplateStringsArray, ...args: any[]) => 
    styled.div.withConfig({
      shouldForwardProp: (prop) => prop !== 'active'
    })<P & WithActive>(styles, ...args),
    
  withRevealed: <P extends {}>(styles: TemplateStringsArray, ...args: any[]) => 
    styled.div.withConfig({
      shouldForwardProp: (prop) => !['revealed', 'hasMine', 'isAnimating'].includes(prop as string)
    })<P & WithRevealed>(styles, ...args),
}; 