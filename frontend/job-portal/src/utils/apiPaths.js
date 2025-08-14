export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    GET_PROFILE: "/api/v1/auth/profile",
    UPDATE_PROFILE: "/api/v1/user/profile",
    DELETE_RESUME: "/api/v1/user/resume",
  },

  DASHBOARD: {
    OVERVIEW: `/api/v1/analytics/overview`,
  },

  JOBS: {
    GET_ALL_JOBS: "/api/v1/jobs",
    GET_JOB_BY_ID: (id) => `/api/v1/jobs/${id}`,
    POST_JOB: "/api/v1/jobs",
    GET_JOBS_EMPLOYER: "/api/v1/jobs/get-jobs-employer",
    UPDATE_JOB: (id) => `/api/v1/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/v1/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/v1/jobs/${id}`,

    SAVE_JOB: (id) => `/api/v1/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/v1/save-jobs/${id}`,
    GET_SAVED_JOBS: "/api/v1/save-jobs/my",
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/v1/applications/${id}`,
    GET_ALL_APPLICATIONS: (id) => `/api/v1/applications/job/${id}`,
    UPDATE_STATUS: (id) => `/api/v1/applications/${id}/status`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
};
