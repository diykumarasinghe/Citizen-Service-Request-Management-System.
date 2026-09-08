// Validation rules matching backend specifications exactly

export const NAME_REGEX = /^[A-Za-z ]+$/;
export const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const PHONE_REGEX = /^[0-9]{10}$/;
export const SEARCH_REGEX = /^[a-zA-Z0-9@._+\- ]*$/;

export const validateName = (name) => {
  if (!name || !name.trim()) return "This field is required.";
  if (!NAME_REGEX.test(name.trim())) {
    return "Name can contain letters and spaces only.";
  }
  return "";
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return "This field is required.";
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return "";
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return "This field is required.";
  if (!PHONE_REGEX.test(phone.trim())) {
    return "Phone number must contain exactly 10 digits.";
  }
  return "";
};

export const validateSearch = (term) => {
  if (!term) return "";
  if (!SEARCH_REGEX.test(term)) {
    return "Special characters are not allowed in search.";
  }
  return "";
};

export const validateRequired = (val) => {
  if (val === undefined || val === null || val === "" || (typeof val === "string" && !val.trim())) {
    return "This field is required.";
  }
  return "";
};

export const validateDescription = (desc) => {
  if (!desc || !desc.trim()) return "This field is required.";
  const len = desc.trim().length;
  if (len < 10 || len > 500) {
    return "Description must be between 10 and 500 characters.";
  }
  return "";
};

export const validateLocation = (loc) => {
  if (!loc || !loc.trim()) return "This field is required.";
  const len = loc.trim().length;
  if (len < 5 || len > 250) {
    return "Location / Address must be between 5 and 250 characters.";
  }
  return "";
};

export const validateFutureDate = (dateString) => {
  if (!dateString) return "This field is required.";
  const selected = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) {
    return "Past dates cannot be selected. Please select today or a future date.";
  }
  return "";
};

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
