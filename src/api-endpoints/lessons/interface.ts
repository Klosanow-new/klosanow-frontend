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
