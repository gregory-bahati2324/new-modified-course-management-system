// University structure based on MUST organization

export interface Department {
  id: string;
  name: string;
  collegeId: string;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
}

export const colleges: College[] = [
  { id: 'cet', name: 'College of Engineering and Technology', shortName: 'CET' },
  { id: 'coact', name: 'College of Architecture and Construction Technology', shortName: 'CoACT' },
  { id: 'coict', name: 'College of Information and Communication Technology', shortName: 'CoICT' },
  { id: 'coste', name: 'College of Science and Technical Education', shortName: 'CoSTE' },
  { id: 'cohbs', name: 'College of Humanities and Business Studies', shortName: 'CoHBS' },
  { id: 'coast', name: 'College of Agricultural Science and Technology', shortName: 'CoAST' },
  { id: 'mrcc', name: 'MUST Rukwa Campus College', shortName: 'MRCC' },
];

export const departments: Department[] = [
  // CET Departments
  { id: 'cet-civil', name: 'Department of Civil Engineering', collegeId: 'cet' },
  { id: 'cet-electrical', name: 'Department of Electrical and Power Engineering', collegeId: 'cet' },
  { id: 'cet-geosciences', name: 'Department of Geosciences and Mining Technology', collegeId: 'cet' },
  { id: 'cet-mechanical', name: 'Department of Mechanical and Industrial Engineering', collegeId: 'cet' },
  { id: 'cet-chemical', name: 'Department of Chemical and Environmental Engineering', collegeId: 'cet' },
  
  // CoACT Departments
  { id: 'coact-architecture', name: 'Department of Architecture and Art Design', collegeId: 'coact' },
  { id: 'coact-construction', name: 'Department of Construction Management and Technology', collegeId: 'coact' },
  { id: 'coact-urban', name: 'Department of Urban Planning and Real Estate Studies', collegeId: 'coact' },
  
  // CoICT Departments
  { id: 'coict-cse', name: 'Department of Computer Science and Engineering', collegeId: 'coict' },
  { id: 'coict-ete', name: 'Department of Electronics and Telecommunications Engineering', collegeId: 'coict' },
  { id: 'coict-informatics', name: 'Department of Informatics', collegeId: 'coict' },
  { id: 'coict-ist', name: 'Department of Information Systems and Technology', collegeId: 'coict' },
  
  // CoSTE Departments
  { id: 'coste-applied', name: 'Department of Applied Sciences', collegeId: 'coste' },
  { id: 'coste-medical', name: 'Department of Medical Sciences and Technology', collegeId: 'coste' },
  { id: 'coste-natural', name: 'Department of Natural Sciences', collegeId: 'coste' },
  { id: 'coste-technical', name: 'Department of Technical Education', collegeId: 'coste' },
  { id: 'coste-earth', name: 'Department of Earth Sciences', collegeId: 'coste' },
  { id: 'coste-mathematics', name: 'Department of Mathematics and Statistics', collegeId: 'coste' },
  
  // CoHBS Departments
  { id: 'cohbs-business', name: 'Department of Business Management', collegeId: 'cohbs' },
  { id: 'cohbs-humanities', name: 'Department of Humanities', collegeId: 'cohbs' },
  
  // CoAST Departments
  { id: 'coast-food', name: 'Department of Food Sciences and Technology', collegeId: 'coast' },
  { id: 'coast-crop', name: 'Department of Crop Science and Horticulture', collegeId: 'coast' },
  
  // MRCC Departments
  { id: 'mrcc-business', name: 'Department of Business Management', collegeId: 'mrcc' },
  { id: 'mrcc-mechanical', name: 'Department of Mechanical and Industrial Engineering', collegeId: 'mrcc' },
];

export const levels = [
  { id: 'certificate', name: 'Certificate' },
  { id: 'ordinary_diploma', name: 'Ordinary Diploma' },
  { id: 'diploma', name: 'Diploma' },
  { id: 'advanced_diploma', name: 'Advanced Diploma' },
  { id: 'bachelor', name: 'Bachelor' },
  { id: 'post_diploma', name: 'Postgraduate Diploma' },
  { id: 'atc', name: 'ATC II' },
  { id: 'cpa', name: 'Certified Public Accountant (CPA(T))' },
  { id: 'masters', name: "Master's" },
  { id: 'doctory_of_philosophy', name: 'Doctory of Philosophy' },
];


export const courseTypes = [
  { id: 'normal', name: 'Normal Course' },
  { id: 'short', name: 'Short Course' },
];

export function getDepartmentsByCollege(collegeId: string): Department[] {
  return departments.filter(dept => dept.collegeId === collegeId);
}