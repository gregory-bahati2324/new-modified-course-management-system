import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SortableItem({
  id,
  lesson,
  isModule = false,
  children,
  handlePreviewLesson,
  handleDeleteLesson,
  onEdit,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, data: { moduleId: lesson?.module_id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Module wrapper: drag handle only, children render accordion + lessons
  if (isModule) {
    return (
      <div ref={setNodeRef} style={style}>
        {React.cloneElement(children, { ...attributes, ...listeners })}
      </div>
    );
  }

  // Lesson item: drag only on GripVertical, buttons fully clickable
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
    >
      <GripVertical
        className="h-4 w-4 text-muted-foreground cursor-grab"
        {...attributes}
        {...listeners} // drag enabled only on this icon
      />
      <div className="flex-1">
        <h5 className="font-medium text-sm">{lesson?.title || 'Untitled Lesson'}</h5>
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
