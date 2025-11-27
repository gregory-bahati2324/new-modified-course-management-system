import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SortableItem({ id, lesson, handlePreviewLesson, handleDeleteLesson, onEdit }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <h5 className="font-medium text-sm">{lesson.title}</h5>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => handlePreviewLesson(lesson.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDeleteLesson}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
