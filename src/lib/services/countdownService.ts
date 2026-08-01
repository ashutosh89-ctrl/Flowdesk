export interface CountdownInfo {
  label: string;
  badgeClass: string;
  isOverdue: boolean;
  days: number;
}

export function getCountdown(dueDateStr?: string): CountdownInfo {
  if (!dueDateStr) {
    return {
      label: 'No Due Date',
      badgeClass: 'bg-gray-100 text-gray-500 border-gray-200',
      isOverdue: false,
      days: 999
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDateStr);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      label: `Overdue by ${absDays} ${absDays === 1 ? 'Day' : 'Days'}`,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 font-extrabold',
      isOverdue: true,
      days: diffDays
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due Today',
      badgeClass: 'bg-red-50 text-red-700 border-red-200 font-extrabold',
      isOverdue: true,
      days: 0
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Tomorrow',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
      isOverdue: false,
      days: 1
    };
  }

  if (diffDays <= 7) {
    return {
      label: `${diffDays} Days Left`,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
      isOverdue: false,
      days: diffDays
    };
  }

  return {
    label: `${diffDays} Days Left`,
    badgeClass: 'bg-gray-50 text-gray-600 border-gray-200 font-medium',
    isOverdue: false,
    days: diffDays
  };
}
