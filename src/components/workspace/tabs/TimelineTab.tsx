'use client';
import React from 'react';
import { TimelineTab as ExistingTimelineTab } from '../TimelineTab';
import { Activity } from '@/lib/types';

interface TimelineTabProps {
  activities: Activity[];
}

export function TimelineTab({ activities }: TimelineTabProps) {
  return <ExistingTimelineTab activities={activities} />;
}
