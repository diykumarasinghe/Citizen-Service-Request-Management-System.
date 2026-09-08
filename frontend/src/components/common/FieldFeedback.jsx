import React from 'react';

const FieldFeedback = ({ error }) => {
  if (!error) return null;
  return (
    <span className="field-error-text" role="alert">
      {error}
    </span>
  );
};

export default FieldFeedback;
