module.exports = {
  //? HTTP Status Codes
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    NOT_MODIFIED: 304,
  },

  //? Validation Rules
  VALIDATION_RULES: {
    SIGNUP: {
      name: "required|string|min:2",
      email: "required|email",
      password:
        "required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/",
      role: "required|in:Employer,JobSeeker",
      phone: "required|min:10",
      companyId:
        "required_if:role,Employer|regex:/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/",
      profilePic: "nullable|mimes:jpeg,png,jpg",
      resume: "nullable|mimes:pdf,doc,docx",
    },

    LOGIN: {
      email: "required|email",
      password: "required|string|min:8",
      role: "required|in:Employer,JobSeeker,Admin",
    },

    UPDATE_USER: {
      name: "string|min:2",
      phone: "string|min:10",
      profilePic: "nullable|mimes:jpeg,png,jpg",
      resume: "nullable|mimes:pdf,doc,docx",
      companyId:
        "nullable|regex:/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/",
      isBlocked: "boolean",
    },

    CREATE_COMPANY: {
      companyName: "required|string",
      industry: "required|string",
      companySize: "required|in:1-10,11-50,51-200,201-500,501+",
      location: "required|string",
      website: "url",
      about: "string",
      foundedYear: "integer|min:1800|max:2025",
      companyLogo: "nullable|mimes:jpeg,png,jpg",
    },

    SCHEDULE_INTERVIEW: {
      scheduledDate: "required|date",
      interviewLocation: "required|string",
      message: "string|max:500",
    },
    ADD_FEEDBACK: {
      jobSeekerId: "required|string",
      feedbackText: "required|string|min:10",
      rating: "integer|min:1|max:5",
    },
    UPDATE_FEEDBACK: {
      feedbackText: "required|string|min:10",
      rating: "integer|min:1|max:5",
    },
  },
};
