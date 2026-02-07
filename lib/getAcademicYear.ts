const currentYear = new Date().getFullYear();


export function getAcademicYear() {
  return `${currentYear -1}/${currentYear}`;
}