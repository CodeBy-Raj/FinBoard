'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

export function SortableWidget({
  id,
  children,
  gridColumn,
}: {
  id: string;
  children: React.ReactNode;
  gridColumn?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        gridColumn,
        isDragging && 'opacity-75'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 h-6 w-6 cursor-grab touch-none rounded-md bg-gray-500/50 p-1 text-white/75 transition-colors hover:bg-gray-500"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}
