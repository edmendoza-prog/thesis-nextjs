'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Profile = {
  name: string;
  email: string;
  studentNumber: string;
  guardianName: string;
  guardianContact: string;
  birthDate: string;
};

const emptyProfile: Profile = { name: '', email: '', studentNumber: '', guardianName: '', guardianContact: '', birthDate: '' };

const badges = [
  { name: 'Math Explorer', detail: 'Completed three number quests', icon: 'ri-calculator-line', tone: 'bg-[#fff1d2] text-[#d97706]' },
  { name: 'Reading Star', detail: 'Finished a reading challenge', icon: 'ri-book-open-line', tone: 'bg-primary-100 text-primary-700' },
  { name: 'Curious Scientist', detail: 'Joined a science activity', icon: 'ri-flask-line', tone: 'bg-accent-100 text-accent-700' },
];

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [activeView, setActiveView] = useState<'profile' | 'awards'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/student/profile');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load profile');
        setProfile(data.profile ?? emptyProfile);
      } catch (error) {
        console.error('Student profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const update = (field: keyof Profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('/api/student/profile', {
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

  const initials = profile.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'S';

  return (
    <main className="min-h-screen bg-primary-100 p-4 text-foreground-900 lg:p-6">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-5 flex items-center justify-between">
          <p className="font-heading text-lg font-bold text-foreground-700">Student portal</p>
          <Link href="/student-dashboard" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-primary-700 transition hover:bg-primary-50">
            <i className="ri-arrow-left-line" aria-hidden="true" /> Learning overview
          </Link>
        </header>

        {loading ? (
          <div className="rounded-xl border border-primary-200 bg-white p-6 text-sm text-foreground-500 shadow-sm">Loading profile...</div>
        ) : (
          <>
            <section className="overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
              <div className="h-28 bg-[#168477] [background-image:linear-gradient(30deg,rgba(255,255,255,.08)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.08)_87.5%,rgba(255,255,255,.08)),linear-gradient(150deg,rgba(255,255,255,.08)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.08)_87.5%,rgba(255,255,255,.08))] [background-size:42px_72px]" />
              <div className="relative flex flex-col gap-4 px-5 pb-5 pt-13 sm:flex-row sm:items-end sm:justify-between sm:px-7">
                <div className="absolute -top-13 left-5 flex h-25 w-25 items-center justify-center rounded-full border-4 border-white bg-[#ffcb69] font-heading text-4xl font-bold text-[#102a43] shadow-lg sm:left-7">{initials}</div>
                <div>
                  <h1 className="font-heading text-3xl font-bold">{profile.name || 'Student'}</h1>
                  <p className="mt-1 text-sm text-foreground-500">{profile.studentNumber || 'Student profile'} · Active student</p>
                </div>
                <button type="button" onClick={() => setActiveView('profile')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700">
                  <i className="ri-pencil-line" aria-hidden="true" /> Edit profile
                </button>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
              <aside className="h-fit rounded-xl border border-primary-200 bg-white p-3 shadow-sm">
                <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-foreground-400">My profile</p>
                <nav className="space-y-1" aria-label="Profile navigation">
                  <button type="button" onClick={() => setActiveView('profile')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition ${activeView === 'profile' ? 'bg-primary-500 text-white' : 'text-foreground-600 hover:bg-primary-50'}`}>
                    <i className="ri-user-3-line text-lg" aria-hidden="true" /> Profile
                  </button>
                  <button type="button" onClick={() => setActiveView('awards')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition ${activeView === 'awards' ? 'bg-primary-500 text-white' : 'text-foreground-600 hover:bg-primary-50'}`}>
                    <i className="ri-medal-line text-lg" aria-hidden="true" /> Awards
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${activeView === 'awards' ? 'bg-white/20 text-white' : 'bg-[#fff1d2] text-[#d97706]'}`}>{badges.length}</span>
                  </button>
                </nav>
                <div className="mx-3 my-4 border-t border-primary-100" />
                <div className="px-3 pb-2"><p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground-400">Learning status</p><p className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-700"><span className="h-1.5 w-1.5 rounded-full bg-accent-500" />Active learner</p></div>
              </aside>

              {activeView === 'profile' ? (
                <form onSubmit={save} className="overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
                  <div className="border-b border-primary-200 px-5 py-4"><h2 className="font-heading text-2xl font-bold">Profile information</h2><p className="mt-1 text-sm text-foreground-500">This information helps your teacher and school support you.</p></div>
                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <label className="text-sm font-bold text-foreground-700">Full name<input required value={profile.name} onChange={(event) => update('name', event.target.value)} className="mt-2 w-full rounded-lg border border-background-300 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
                    <label className="text-sm font-bold text-foreground-700">Email address<input required type="email" value={profile.email} onChange={(event) => update('email', event.target.value)} className="mt-2 w-full rounded-lg border border-background-300 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
                    <label className="text-sm font-bold text-foreground-700">Student number<input value={profile.studentNumber} onChange={(event) => update('studentNumber', event.target.value)} placeholder="e.g. S-20241" className="mt-2 w-full rounded-lg border border-background-300 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
                    <label className="text-sm font-bold text-foreground-700">Birth date<input type="date" value={profile.birthDate} onChange={(event) => update('birthDate', event.target.value)} className="mt-2 w-full rounded-lg border border-background-300 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
                    <label className="text-sm font-bold text-foreground-700 sm:col-span-2">Guardian name<input value={profile.guardianName} onChange={(event) => update('guardianName', event.target.value)} placeholder="Parent or guardian name" className="mt-2 w-full rounded-lg border border-background-300 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
                    <label className="text-sm font-bold text-foreground-700 sm:col-span-2">Guardian contact<input value={profile.guardianContact} onChange={(event) => update('guardianContact', event.target.value)} placeholder="Phone number or email" className="mt-2 w-full rounded-lg border border-background-300 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" /></label>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-primary-200 bg-background-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className={`text-sm font-bold ${saved ? 'text-accent-700' : 'text-foreground-500'}`}>{saved ? 'Profile saved successfully.' : 'Update your details, then save your profile.'}</p><button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"><i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'} aria-hidden="true" />{saving ? 'Saving profile...' : 'Save profile'}</button></div>
                </form>
              ) : (
                <div className="space-y-6">
                  <section className="rounded-xl border border-primary-200 bg-white p-5 shadow-sm"><h2 className="font-heading text-2xl font-bold">Awards</h2><p className="mt-1 text-sm text-foreground-500">Every finished lesson is a chance to earn a new achievement.</p><div className="mt-5 divide-y divide-primary-100">{badges.map((badge) => <article key={badge.name} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"><span className={`flex h-11 w-11 items-center justify-center rounded-lg ${badge.tone}`}><i className={`${badge.icon} text-xl`} aria-hidden="true" /></span><div className="min-w-0 flex-1"><h3 className="font-bold text-foreground-900">{badge.name}</h3><p className="mt-1 text-sm text-foreground-500">{badge.detail}</p></div><span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-700">Earned</span></article>)}</div></section>
                  <section className="rounded-xl bg-[#173f3a] p-5 text-white shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9ed7c5]">Weekly goal</p><h2 className="mt-2 font-heading text-2xl font-bold">Almost there</h2></div><i className="ri-focus-3-line text-2xl text-[#f7c96b]" aria-hidden="true" /></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[72%] rounded-full bg-[#f7c96b]" /></div><div className="mt-3 flex justify-between text-sm"><span>7 of 10 activities</span><span className="font-bold">72%</span></div></section>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
