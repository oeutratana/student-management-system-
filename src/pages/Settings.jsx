import { Bell, CalendarClock, Save, School, SlidersHorizontal, Target } from "lucide-react"

const Settings = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_40px_-28px_rgba(16,24,40,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <SlidersHorizontal size={22} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">
              Preferences
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Update school profile, academic year, and account preferences.
            </p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
          type="button"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <School size={20} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">School Profile</h2>
              <p className="text-sm text-slate-500">Basic information about your institution</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-[13px] font-bold text-slate-600">School Name</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                defaultValue="Bright Future High School"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[13px] font-bold text-slate-600">Academic Year</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                defaultValue="2026"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[13px] font-bold text-slate-600">Email</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                defaultValue="admin@brightfuture.edu"
                type="email"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[13px] font-bold text-slate-600">Phone</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                defaultValue="+855 12 345 678"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <SlidersHorizontal size={20} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Preferences</h2>
              <p className="text-sm text-slate-500">Tune how the system notifies and alerts you</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm">
              <span className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Bell size={18} />
                </span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-extrabold text-slate-900">Email Notifications</span>
                  <span className="text-xs text-slate-500">Send daily summaries to administrators.</span>
                </span>
              </span>
              <input className="h-5 w-5 accent-indigo-600" defaultChecked type="checkbox" />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm">
              <span className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CalendarClock size={18} />
                </span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-extrabold text-slate-900">Attendance Alerts</span>
                  <span className="text-xs text-slate-500">Flag repeated absences automatically.</span>
                </span>
              </span>
              <input className="h-5 w-5 accent-indigo-600" defaultChecked type="checkbox" />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm">
              <span className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-amber-50 text-amber-500">
                  <Target size={18} />
                </span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-extrabold text-slate-900">Score Review</span>
                  <span className="text-xs text-slate-500">Show students below class target.</span>
                </span>
              </span>
              <input className="h-5 w-5 accent-indigo-600" type="checkbox" />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
