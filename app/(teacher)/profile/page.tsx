'use client';

import { useEffect, useState } from 'react';
import UserAvatar from '@/app/components/UserAvatar';
import AvatarPickerModal from '@/app/components/AvatarPickerModal';

type Profile = {
  id?: number;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  bio: string;
  avatarSeed?: string;
};

const emptyProfile: Profile = { name: '', email: '', employeeId: '', department: '', designation: '', bio: '', avatarSeed: '' };

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/teacher/profile');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load profile');
        setProfile(data.profile ?? emptyProfile);
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const updateProfile = (field: keyof Profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleAvatarSelect = async (newSeed: string) => {
    setProfile((current) => ({ ...current, avatarSeed: newSeed }));
    setSaved(false);

    try {
      setSaving(true);
      const payload = { ...profile, avatarSeed: newSeed };
      const response = await fetch('/api/teacher/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error('Failed to auto-save teacher avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('/api/teacher/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save profile');
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  const effectiveAvatarSeed =
    profile.avatarSeed ||
    profile.employeeId ||
    (profile.id ? String(profile.id) : '') ||
    profile.name ||
    'Teacher';

  return (
    <div className="mx-auto max-w-[1120px]">
      <header className="mb-7 border-b border-primary-200/70 pb-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-accent-700">Teacher workspace</p>
        <h1 className="font-heading text-4xl font-bold text-foreground-900">Profile information</h1>
      </header>

      {loading ? (
        <div className="rounded-xl border border-primary-200 bg-background-50 p-6 text-sm text-foreground-500 shadow-sm">Loading profile...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-xl border border-primary-200 bg-background-50 p-6 text-center shadow-sm">
            {/* Clickable Avatar Container */}
            <div className="relative mx-auto w-24">
              <div
                className="group flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 overflow-hidden border-2 border-primary-200 shadow-md cursor-pointer transition-transform hover:scale-105"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Click to customize your avatar"
              >
                <UserAvatar seed={effectiveAvatarSeed} size={96} className="w-full h-full" />
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#4255FF] text-white text-xs border-2 border-white shadow-sm hover:scale-110 transition cursor-pointer"
                title="Change Avatar"
              >
                ✏️
              </button>
            </div>

            <h2 className="mt-4 font-heading text-2xl font-bold text-foreground-900">{profile.name || 'Teacher'}</h2>
            <p className="mt-1 text-sm text-foreground-500">{profile.designation || 'Teacher'}</p>

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <span>🎨</span> Customize Avatar
            </button>

            <div className="my-5 border-t border-primary-100" />
            <div className="space-y-3 text-left text-sm">
              <p>
                <span className="block text-xs font-bold uppercase tracking-wide text-foreground-400">Employee ID</span>
                <span className="mt-1 block font-semibold text-foreground-700">{profile.employeeId || 'Not set'}</span>
              </p>
              <p>
                <span className="block text-xs font-bold uppercase tracking-wide text-foreground-400">Department</span>
                <span className="mt-1 block font-semibold text-foreground-700">{profile.department || 'Not set'}</span>
              </p>
            </div>
          </aside>

          <form onSubmit={saveProfile} className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm">
            <div className="border-b border-primary-200 px-5 py-4">
              <h2 className="font-heading text-2xl font-bold text-foreground-900">Personal details</h2>
              <p className="mt-1 text-sm text-foreground-500">Information visible to your school community.</p>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <label className="block text-sm font-bold text-foreground-700">Full name<input required value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} className="mt-2 w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
              <label className="block text-sm font-bold text-foreground-700">Email address<input required type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} className="mt-2 w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
              <label className="block text-sm font-bold text-foreground-700">Employee ID<input value={profile.employeeId} onChange={(event) => updateProfile('employeeId', event.target.value)} placeholder="e.g. T-1001" className="mt-2 w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
              <label className="block text-sm font-bold text-foreground-700">Department<input value={profile.department} onChange={(event) => updateProfile('department', event.target.value)} placeholder="e.g. Elementary" className="mt-2 w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
              <label className="block text-sm font-bold text-foreground-700 sm:col-span-2">Designation<input value={profile.designation} onChange={(event) => updateProfile('designation', event.target.value)} placeholder="e.g. Grade Teacher" className="mt-2 w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
              <label className="block text-sm font-bold text-foreground-700 sm:col-span-2">About you<textarea value={profile.bio} onChange={(event) => updateProfile('bio', event.target.value)} rows={5} placeholder="Share a short introduction with your students and colleagues." className="mt-2 w-full resize-y rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
            </div>
            <div className="flex flex-col gap-3 border-t border-primary-200 bg-background-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-sm font-bold ${saved ? 'text-accent-700' : 'text-foreground-500'}`}>{saved ? 'Profile saved successfully.' : 'Update your details, then save your profile.'}</p>
              <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60">
                <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'} aria-hidden="true" />
                {saving ? 'Saving profile...' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        currentSeed={effectiveAvatarSeed}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        title="Customize Teacher Avatar"
        description="Choose a friendly avatar style for your teacher account."
      />
    </div>
  );
}