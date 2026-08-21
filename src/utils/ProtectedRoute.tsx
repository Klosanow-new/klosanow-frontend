import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RootState } from "../redux/store";
import { setPostAuthRedirect } from "./constant";

const ProtectedRoute = () => {
  const user = useSelector((state: RootState) => state.user?.data);
  const location = useLocation();

  if (!user) {
    // Remember the destination so a shared link survives the sign-in detour.
    setPostAuthRedirect(`${location.pathname}${location.search}`);
    return <Navigate to="/sign-in" />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
