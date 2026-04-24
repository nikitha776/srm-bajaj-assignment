import dotenv from "dotenv";

dotenv.config();

function slugifyFullName(fullName) {
  return fullName.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getIdentity() {
  const fullName = process.env.FULL_NAME ?? "Vissamsetty Lakshmi Nikitha";
  const dob = process.env.DOB_DDMMYYYY ?? "07072006";

  return {
    user_id: `${slugifyFullName(fullName)}_${dob}`,
    email_id: process.env.EMAIL_ID ?? "lakshminikitha_vissamsetty@srmap.edu.in",
    college_roll_number:
      process.env.COLLEGE_ROLL_NUMBER ?? "AP23110011195",
  };
}

