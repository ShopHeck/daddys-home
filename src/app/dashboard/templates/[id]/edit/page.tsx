import { TemplateEditor } from '@/components/dashboard/TemplateEditor';

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  return <TemplateEditor templateId={params.id} />;
}
