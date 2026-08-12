// Small UI-only department access helper for prototype preview

export interface DepartmentOption {
  code: string;
  name: string;
}

export const DEPARTMENTS_LIST: DepartmentOption[] = [
  { code: 'CE', name: 'Computer Engineering' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ECE', name: 'Electronics & Communication' },
  { code: 'ME', name: 'Mechanical Engineering' },
];

export const ADMIN_DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { code: 'ALL', name: 'All Departments' },
  ...DEPARTMENTS_LIST,
];

export const getDepartmentName = (code?: string | null): string => {
  if (!code || code === 'ALL') return 'All Departments';
  const found = DEPARTMENTS_LIST.find((d) => d.code === code || d.name.toLowerCase() === code.toLowerCase());
  return found ? found.name : code;
};

export const isAdmin = (role?: string): boolean => role === 'admin';
export const isHod = (role?: string): boolean => role === 'hod';

export const filterItemsByDepartment = <T extends { department?: string; departmentCode?: string }>(
  items: T[],
  deptCode?: string | null
): T[] => {
  if (!deptCode || deptCode === 'ALL') return items;
  const deptName = getDepartmentName(deptCode).toLowerCase();
  const codeUpper = deptCode.toUpperCase();

  return items.filter((item) => {
    const itemDept = item.department?.toLowerCase() || '';
    const itemCode = item.departmentCode?.toUpperCase() || '';
    return (
      itemCode === codeUpper ||
      itemDept === deptName.toLowerCase() ||
      itemDept.includes(codeUpper.toLowerCase()) ||
      (codeUpper === 'CE' && itemDept.includes('computer engineering')) ||
      (codeUpper === 'IT' && itemDept.includes('information technology')) ||
      (codeUpper === 'CSE' && itemDept.includes('computer science')) ||
      (codeUpper === 'ECE' && itemDept.includes('electronics')) ||
      (codeUpper === 'ME' && itemDept.includes('mechanical'))
    );
  });
};
