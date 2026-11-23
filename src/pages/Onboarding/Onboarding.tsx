import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import SplashScreen from "../SplashScreen/SplashScreen";
import OnboardingSlides from "../OnboardingSlides/OnboardingSlides";
import { slides } from "./utils/SlideData";
import { useStoreSelector } from "src/redux/hooks";
import { dashboardPagePath } from "src/data/pageUrl";

const FIRST_VISIT_KEY = "isFirstVisit";

/**
 * Entry route. Signed-in users go straight to the dashboard (previously they
 * sat through the splash and were then sent to sign-in), returning visitors
 * go to sign-in, and first-time visitors get a short splash and the slides.
 */
const Onboarding = () => {
  const user = useStoreSelector((state) => state.user?.data);
  const isReturning = localStorage.getItem(FIRST_VISIT_KEY) === "true";
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (user) return;
    const id = window.setTimeout(() => setSplashDone(true), 1600);
    return () => window.clearTimeout(id);
  }, [user]);

  useEffect(() => {
    if (!user && !isReturning) localStorage.setItem(FIRST_VISIT_KEY, "true");
  }, [user, isReturning]);

  if (user) return <Navigate to={dashboardPagePath} replace />;
  if (!splashDone) return <SplashScreen />;
  if (isReturning) return <Navigate to="/sign-in" replace />;
  return <OnboardingSlides slides={slides} />;
};

export default Onboarding;
