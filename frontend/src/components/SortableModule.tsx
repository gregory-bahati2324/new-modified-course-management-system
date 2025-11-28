import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, GripVertical } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

export function SortableModule({
  module,
  moduleIndex,
  selectedCourseId,
  handlePreviewLesson,
  handleDeleteLesson,
  handleDeleteModule,
  handleEditModule,
}: any) {
  const navigate = useNavigate();

  return (
    <Accordion type="single" collapsible className="space-y-4 mb-4">
      <AccordionItem value={module.id} className="border rounded-lg">
        <AccordionTrigger className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Drag handle */}
            <SortableItem id={module.id} isModule>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            </SortableItem>

            <Badge variant="outline">Module {moduleIndex + 1}</Badge>
            <h3 className="font-semibold">{module.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{module.lessons?.length || 0} lessons</Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <Card className="mt-2">
            <CardContent className="space-y-3">
              {/* Lessons Header */}
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Lessons</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={ () => handleEditModule(module)}
                  >
                     Edit Module
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/instructor/course/${selectedCourseId}/module/${module.id}/add-lesson`
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Lesson
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lessons List */}
              {module.lessons && module.lessons.length > 0 ? (
                <SortableContext
                  items={module.lessons.map((l: any) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {module.lessons.map((lesson: any) => (
                    <SortableItem
                      key={lesson.id}
                      id={lesson.id}
                      lesson={lesson}
                      handlePreviewLesson={handlePreviewLesson}
                      handleDeleteLesson={() => handleDeleteLesson(lesson.id, module.id)}
                      onEdit={() =>
                        navigate(
                          `/instructor/course/${selectedCourseId}/module/${module.id}/add-lesson/${lesson.id}`
                        )
                      }
                      moduleId={module.id}
                    />
                  ))}
                </SortableContext>
              ) : (
                <div className="text-center py-8 border rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No lessons yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
