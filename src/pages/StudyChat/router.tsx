import React from "react";
import { Route, Routes } from "react-router-dom";
import {
  contactsPageSlug,
  createStudyChatSlug,
  AIStudychat,
} from "../../data/pageUrl";

const StudyChat = React.lazy(() => import("./pages/StudyChat"));
const CreateStudyChat = React.lazy(() => import("./pages/CreateStudyChat"));
const Contacts = React.lazy(() => import("./pages/Contacts"));
const AiChatPage = React.lazy(
  () => import("../StudyChat/AIChat/component/AIChatPage")
);

const StudyChatRouter: React.FC = () => {
  return (
    <Routes>
      <Route index element={<StudyChat />} />
      <Route path={createStudyChatSlug} element={<CreateStudyChat />} />
      <Route path={contactsPageSlug} element={<Contacts />} />
      <Route path={AIStudychat} element={<AiChatPage />} />
    </Routes>
  );
};

export default StudyChatRouter;
