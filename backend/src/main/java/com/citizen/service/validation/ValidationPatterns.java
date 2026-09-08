package com.citizen.service.validation;

public class ValidationPatterns {
    public static final String NAME_REGEX = "^[a-zA-Z ]+$";
    public static final String NAME_ERROR_MESSAGE = "Name can contain letters and spaces only.";

    public static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    public static final String EMAIL_ERROR_MESSAGE = "Please enter a valid email address.";

    public static final String PHONE_REGEX = "^[0-9]{10}$";
    public static final String PHONE_ERROR_MESSAGE = "Phone number must contain exactly 10 digits.";

    public static final String SEARCH_REGEX = "^[a-zA-Z0-9@._+\\- ]*$";
    public static final String SEARCH_ERROR_MESSAGE = "Special characters are not allowed in search.";

    public static final String REQUIRED_ERROR_MESSAGE = "This field is required.";
    public static final String FUTURE_DATE_ERROR_MESSAGE = "Past dates cannot be selected. Please select today or a future date.";
}
