import dynamic from 'next/dynamic';

const TemplateEditor = dynamic(
  () => import('@/components/dashboard/TemplateEditor').then(m => ({ default: m.TemplateEditor })),
  { ssr: false }
);

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  return <TemplateEditor templateId={params.id} />;
}
