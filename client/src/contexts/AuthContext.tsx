import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../utils/api";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  subscriptionStatus: string;
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Set token in API headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Verify token and get user profile
          const response = await api.get("/api/auth/profile");
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: response.data, token },
          });
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem("token");
          dispatch({ type: "AUTH_FAILURE", payload: "Session expired" });
        }
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: "" });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
        ipAddress: "127.0.0.1", // In production, get real IP
        userAgent: navigator.userAgent,
      });

      const { access_token, user } = response.data;

      // Store token
      localStorage.setItem("token", access_token);

      // Set token in API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, token: access_token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: "AUTH_START" });
    try {
      await api.post("/api/auth/register", userData);
      dispatch({ type: "AUTH_FAILURE", payload: "" }); // Clear any previous errors
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await api.post("/api/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Remove token and clear headers
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
