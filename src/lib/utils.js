import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export const isIframe = window.self !== window.top;

export function parseMessageMetadata(messageStr) {
  if (!messageStr) {
    return {
      message: "",
      occasion: null,
      layoutId: null
    };
  }
  
  const occasionMatch = messageStr.match(/\|\|occasion:([a-zA-Z0-9_-]+)/);
  const layoutMatch = messageStr.match(/\|\|layout:([a-zA-Z0-9_-]+)/);
  
  const occasion = occasionMatch ? occasionMatch[1] : null;
  const layoutId = layoutMatch ? layoutMatch[1] : null;
  
  const message = messageStr
    .replace(/\|\|occasion:[a-zA-Z0-9_-]+/g, "")
    .replace(/\|\|layout:[a-zA-Z0-9_-]+/g, "")
    .trim();
    
  return { message, occasion, layoutId };
}