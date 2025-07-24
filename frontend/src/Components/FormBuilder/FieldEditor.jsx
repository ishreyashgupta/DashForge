// frontend/src/Components/FormBuilder/FieldEditor.jsx
import React from "react";
import { FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

function FieldEditor({ field, index, onUpdate, onRemove, onMove, canMoveUp, canMoveDown }) {
  const updateField = (key, value) => {
    onUpdate({ ...field, [key]: value });
  };

  const addOption = () => {
    const newOptions = [...field.options, `Option ${field.options.length + 1}`];
    updateField('options', newOptions);
  };

  const updateOption = (optionIndex, value) => {
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField('options', newOptions);
  };

  const removeOption = (optionIndex) => {
    if (field.options.length > 1) {
      const newOptions = field.options.filter((_, i) => i !== optionIndex);
      updateField('options', newOptions);
    }
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className="field-editor">
      <div className="field-header">
        <h4>Field {index + 1}: {field.type}</h4>
        <div className="field-controls">
          <button
            onClick={() => onMove(index, 'up')}
            disabled={!canMoveUp}
            className="btn btn-sm"
            title="Move up"
          >
            <FaArrowUp />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={!canMoveDown}
            className="btn btn-sm"
            title="Move down"
          >
            <FaArrowDown />
          </button>
          <button
            onClick={onRemove}
            className="btn btn-sm btn-danger"
            title="Remove field"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="field-config">
        <div className="form-group">
          <label>Field Label *</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField('label', e.target.value)}
            placeholder="Enter field label"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Placeholder</label>
          <input
            type="text"
            value={field.placeholder}
            onChange={(e) => updateField('placeholder', e.target.value)}
            placeholder="Enter placeholder text"
            className="form-control"
          />
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => updateField('required', e.target.checked)}
          />
          Required field
        </label>

        {needsOptions && (
          <div className="options-config">
            <label>Options</label>
            {field.options.map((option, optionIndex) => (
              <div key={optionIndex} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="form-control"
                />
                <button
                  onClick={() => removeOption(optionIndex)}
                  disabled={field.options.length <= 1}
                  className="btn btn-sm btn-danger"
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={addOption} className="btn btn-sm btn-secondary">
              + Add Option
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FieldEditor;
