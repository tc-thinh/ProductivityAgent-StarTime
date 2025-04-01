import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchBackendService<T>({
  endpoint,
  method,
  body,
}: {
  endpoint: string;
  method: "GET" | "PUT" | "POST" | "DELETE";
  body?: any;
}): Promise<{ success: boolean; data?: T; error?: string }> {
  const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND;

  if (!HTTP_BACKEND) {
    throw new Error("NEXT_PUBLIC_HTTP_BACKEND is not defined");
  }

  try {
    const response = await fetch(`${HTTP_BACKEND}/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...(method !== "GET" && body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! Status: ${response.status}`,
      };
    }

    const data = await response.json().catch(() => null);

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Unknown error",
    };
  }
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const combinePrompt = ({ textPrompt, transcript }: { textPrompt: string; transcript?: string }) => {
  return JSON.stringify({
    text: textPrompt,
    voiceTranscript: transcript
  })
}
