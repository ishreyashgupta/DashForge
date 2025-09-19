// src/Components/UDF/formStructure.jsx

export const dummyFormStructure 
 = [
  {
    fieldName: "Full Name",
    inputType: "text",
    properties: { required: true, placeholder: "Enter your full name" },
  },
  {
    fieldName: "Bio",
    inputType: "textarea",
    properties: { required: false, placeholder: "Tell us about yourself" },
  },
  {
    fieldName: "Subscribe to Newsletter",
    inputType: "checkbox",
    properties: { required: false },
  },
  {
    fieldName: "Gender",
    inputType: "radio",
    properties: { required: true, options: ["Male", "Female", "Other"] },
  },
  {
    fieldName: "Country",
    inputType: "dropdown",
    properties: { required: true, options: ["India", "USA", "UK"] },
  },
  {
    fieldName: "Languages Known",
    inputType: "multiselect",
    properties: { required: false, options: ["English", "Hindi", "Spanish"] },
  },
  {
    fieldName: "Age",
    inputType: "number",
    properties: { required: true, min: 0, max: 120 },
  },
  {
    fieldName: "Date of Birth",
    inputType: "date",
    properties: { required: true },
  },
];


