import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { adminAPI } from "../utils/api";

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

interface AdminState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AdminAction =
  | { type: "ADMIN_START" }
  | { type: "ADMIN_SUCCESS"; payload: { user: AdminUser; token: string } }
  | { type: "ADMIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AdminState = {
  user: null,
  token: localStorage.getItem("adminToken"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case "ADMIN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "ADMIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "ADMIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AdminContextType extends AdminState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        dispatch({ type: "LOGOUT" });
        return;
      }

      try {
        // Validate token by calling profile endpoint
        const response = await adminAPI.getProfile();
        const user = response.data;
        
        dispatch({
          type: "ADMIN_SUCCESS",
          payload: { user, token },
        });
      } catch (error) {
        // Token is invalid, clear it and redirect to login
        localStorage.removeItem("adminToken");
        dispatch({ type: "LOGOUT" });
      }
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "ADMIN_START" });
      const response = await adminAPI.login(email, password);
      const { user, accessToken } = response.data;

      localStorage.setItem("adminToken", accessToken);
      dispatch({
        type: "ADMIN_SUCCESS",
        payload: { user, token: accessToken },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: "ADMIN_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AdminContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
