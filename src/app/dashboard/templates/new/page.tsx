import dynamic from 'next/dynamic';

const TemplateEditor = dynamic(
  () => import('@/components/dashboard/TemplateEditor').then(m => ({ default: m.TemplateEditor })),
  { ssr: false }
);

export default function NewTemplatePage() {
  return <TemplateEditor />;
}
