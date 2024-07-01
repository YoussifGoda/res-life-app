import React, { useState, useEffect } from 'react';

function Modal({ onClose, onSave, fields, dropdownOptions, dropdownLabel, initialValues, modalType }) {
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    if (initialValues) {
      setInputs({ ...initialValues });
    } else {
      setInputs({});
    }
  }, [initialValues]);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (e) => {
    setInputs({ ...inputs, [dropdownLabel]: e.target.value });
  };

  const handleSave = () => {
    onSave(inputs);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{modalType === 'add' ? 'Add RA' : 'Edit RA'}</h3>
        {fields.map((field) => (
          <div className="modal-field" key={field}>
            <label>{field}</label>
            {dropdownLabel && field === 'RA Name' ? (
              <select
                name={dropdownLabel}
                value={inputs[dropdownLabel] || ''}
                onChange={handleDropdownChange}
              >
                <option value="">Select from list</option>
                {dropdownOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name={field}
                value={inputs[field] || ''}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default Modal;