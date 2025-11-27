import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
    <Accordion type="single" collapsible className="space-y-4 mb-4" key={module.id}>
      <AccordionItem value={module.id} className="border rounded-lg">
        <AccordionTrigger className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
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
                    onClick={() => navigate(`/instructor/course/${selectedCourseId}/module/${module.id}/add-lesson`)}
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
                <SortableContext items={module.lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
                  {module.lessons.map((lesson: any, index: number) => (
                    <SortableItem
                      key={lesson.id}
                      id={lesson.id}
                      lesson={lesson}
                      handlePreviewLesson={handlePreviewLesson}
                      handleDeleteLesson={() => handleDeleteLesson(lesson.id, module.id)}
                      onEdit={() =>
                        navigate(`/instructor/course/${selectedCourseId}/module/${module.id}/add-lesson/${lesson.id}`)
                      }
                    />
                  ))}
                </SortableContext>
              ) : (
                <p className="text-muted-foreground text-center py-4">No lessons yet</p>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
