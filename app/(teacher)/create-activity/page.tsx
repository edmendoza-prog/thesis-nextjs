'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateActivityModal from '@/app/components/CreateActivityModal';

function CreateActivityPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');

  const handleClose = () => {
    router.push(classId ? `/library?classId=${classId}` : '/library');
  };

  const handleSaved = () => {
    router.push(classId ? `/library?classId=${classId}` : '/library');
  };

  return (
    <div className="min-h-screen bg-slate-100/50 flex items-center justify-center p-4">
      <CreateActivityModal
        isOpen={true}
        onClose={handleClose}
        initialClassId={classId ? Number(classId) : undefined}
        onSaved={handleSaved}
      />
    </div>
  );
}

export default function CreateActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        </div>
      }
    >
      <CreateActivityPageContent />
    </Suspense>
  );
}
