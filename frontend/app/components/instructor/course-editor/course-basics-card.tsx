import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_LEVELS } from "@/lib/api/courses";
import { EXPERTISE_TOPICS, type ExpertiseTopic } from "@/lib/api/instructors";
import { EditorField } from "./editor-field";
import { ThumbnailUpload } from "./thumbnail-upload";
import type { CourseDraft, DraftActions } from "./course-draft";

type CourseBasicsCardProps = {
  draft: CourseDraft;
  actions: DraftActions;
  disabled: boolean;
  onUploadingChange: (uploading: boolean) => void;
};

/** Course-level fields: title, pitch, description, category, level, cover. */
export function CourseBasicsCard({
  draft,
  actions,
  disabled,
  onUploadingChange,
}: CourseBasicsCardProps) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        Course basics
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        The first things learners see on your course page.
      </p>

      <fieldset disabled={disabled} className="mt-5 space-y-5">
        <EditorField
          label="Course title"
          htmlFor="course-title"
          hint="At least 3 characters to save a draft."
        >
          <Input
            id="course-title"
            value={draft.title}
            maxLength={120}
            onChange={(event) =>
              actions.setMeta({ title: event.target.value })
            }
            placeholder="e.g. Practical TypeScript for Product Teams"
          />
        </EditorField>

        <EditorField
          label="Short subtitle"
          htmlFor="course-subtitle"
          hint="One line that sums up the outcome."
        >
          <Input
            id="course-subtitle"
            value={draft.subtitle}
            maxLength={200}
            onChange={(event) =>
              actions.setMeta({ subtitle: event.target.value })
            }
            placeholder="Ship confident features without fighting the type system"
          />
        </EditorField>

        <EditorField
          label="Description"
          htmlFor="course-description"
          hint="At least 40 characters before you can submit for review."
        >
          <Textarea
            id="course-description"
            value={draft.description}
            maxLength={5000}
            rows={6}
            onChange={(event) =>
              actions.setMeta({ description: event.target.value })
            }
            placeholder="What will learners be able to do by the end? Who is this for, and what should they already know?"
          />
        </EditorField>

        <div className="grid gap-5 sm:grid-cols-2">
          <EditorField label="Category" htmlFor="course-category">
            <Select
              id="course-category"
              value={draft.category}
              onChange={(event) =>
                actions.setMeta({
                  category: event.target.value as ExpertiseTopic,
                })
              }
            >
              {EXPERTISE_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </Select>
          </EditorField>

          <EditorField label="Level" htmlFor="course-level">
            <Select
              id="course-level"
              value={draft.level}
              onChange={(event) =>
                actions.setMeta({
                  level: event.target.value as CourseDraft["level"],
                })
              }
            >
              {COURSE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level[0].toUpperCase() + level.slice(1)}
                </option>
              ))}
            </Select>
          </EditorField>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Thumbnail</p>
          <p className="mt-1 text-xs text-slate-500">
            Shown in the catalog. A 16:9 image works best.
          </p>
          <div className="mt-2">
            <ThumbnailUpload
              thumbnail={draft.thumbnail}
              disabled={disabled}
              onUploaded={actions.setThumbnail}
              onRemoved={() => actions.setThumbnail(null)}
              onUploadingChange={onUploadingChange}
            />
          </div>
        </div>
      </fieldset>
    </section>
  );
}
