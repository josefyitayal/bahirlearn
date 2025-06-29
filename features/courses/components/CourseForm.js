'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

import { courseCreationFromSchema } from '@/zodSchemas/courseCreationFromSchema';
import ImageUploader from '@/components/shared/ImageUploader';

export function CourseForm({ onSubmit, course }) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(courseCreationFromSchema),
    defaultValues: {
      title: course?.title ?? '',
      description: course?.description ?? '',
      price: course?.price ?? 0,
      thumbnail: course?.thumbnail ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-blue-200">
      <div className="my-3">
        <label className="block text-sm font-medium">Course Name</label>
        <Input {...register('title')} placeholder="e.g. Introduction to AI" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <Textarea {...register('description')} placeholder="Write something..." />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Price ($)</label>
        <Input type="number" {...register('price')} />
        {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Thumbnail</label>
        <Controller
          control={control}
          name="thumbnail"
          render={({ field }) => (
            <ImageUploader
              onUpload={(url) => field.onChange(url)}
              prevImage={field.value}
            />
          )}
        />
        {errors.thumbnail && <p className="text-sm text-red-500">{errors.thumbnail.message}</p>}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Done'}
        </Button>
      </DialogFooter>
    </form>
  );
}
