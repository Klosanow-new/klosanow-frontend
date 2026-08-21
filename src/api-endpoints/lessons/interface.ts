import { _token } from "../../utils/axios";
import { Slide } from "../../types/slides";

export interface GenerateSlidesData {
  slides: Slide[];
  warnings: string[];
  meta: {
    filename: string;
    kind: "pdf" | "docx" | "pptx";
    pages: number;
    pagesUsed: number;
    charsExtracted: number;
    condensed: boolean;
    model: string;
    inputTokens: number;
    outputTokens: number;
  };
}

export interface GenerateSlidesResponse {
  status: string;
  message: string;
  data: GenerateSlidesData;
}

export interface LessonResponseInterface {
  status: string;
  message: string;
  data: CreateLessonInterface
}

export interface CreateLessonInterface {
    title: string,
    about: string,
    content: string,
    description: string,
    videoUrl: string,
    tag: string,
    isPrivate: boolean,
    user: string,
}
