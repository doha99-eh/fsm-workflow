import React from 'react';
import PropTypes from 'prop-types';
import FormControl from 'react-bootstrap/lib/FormControl';

export default function StringInput({ value, onChange, ...props }) {
  return (
    <FormControl
      placeholder="Enter value"
      type='text'
      {...props}
      value={value || ''}
      onChange={({ target: { value } }) => onChange(value)}
    />
  )
}

StringInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
}