'use server';

import EditMedicalRecordClient from './client';

export default async function EditMedicalRecordPage({ params }: { params: Promise<{ matric: string }> }) {
  const { matric } = await params;
  return <EditMedicalRecordClient matric={matric} />;
}
