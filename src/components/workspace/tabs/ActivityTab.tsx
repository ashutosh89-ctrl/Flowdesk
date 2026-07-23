'use client';
import React from 'react';
import { ActivityTab as ExistingActivityTab } from '../ActivityTab';
import { Activity } from '@/lib/types';

interface ActivityTabProps {
  activities: Activity[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  return <ExistingActivityTab activities={activities} />;
}
