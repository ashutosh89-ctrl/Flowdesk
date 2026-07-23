import { getDaysOverdue } from './invoiceStatus';

export interface ReminderSchedule {
  sequence: number;
  daysAfterDue: number;
  label: string;
}

export const REMINDER_SCHEDULE: ReminderSchedule[] = [
  { sequence: 1, daysAfterDue: 1, label: 'First Reminder' },
  { sequence: 2, daysAfterDue: 7, label: 'Second Reminder' },
  { sequence: 3, daysAfterDue: 14, label: 'Final Reminder' },
];

export function shouldSendReminder(invoice: any): ReminderSchedule | null {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') return null;
  if (!invoice.dueDate) return null;

  const daysOverdue = getDaysOverdue(invoice);
  const sentSequences = invoice.reminders?.map((r: any) => r.sequence) || [];

  for (const schedule of REMINDER_SCHEDULE) {
    if (daysOverdue >= schedule.daysAfterDue && !sentSequences.includes(schedule.sequence)) {
      return schedule;
    }
  }
  return null;
}

export function getNextReminderInfo(invoice: any): string | null {
  if (invoice.status === 'paid') return null;
  const daysOverdue = getDaysOverdue(invoice);
  const sentSequences = invoice.reminders?.map((r: any) => r.sequence) || [];

  for (const schedule of REMINDER_SCHEDULE) {
    if (!sentSequences.includes(schedule.sequence)) {
      const daysUntil = schedule.daysAfterDue - daysOverdue;
      if (daysUntil > 0) {
        return `Next reminder in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
      }
      return `${schedule.label} pending`;
    }
  }
  return 'All reminders sent';
}
