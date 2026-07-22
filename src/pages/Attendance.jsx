import AttendanceChartWidget from "../components/AttendanceChartWidget";
import {
  CalendarCheck,
  ClipboardCheck,
  Clock,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-600">
              Attendance Center
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-800">Attendance</h1>
            <p className="mt-2 text-gray-500">
              Review daily attendance, weekly trends and recent student records.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
            onClick={() => navigate("/mark-attendance")}
            type="button"
          >
            <Plus size={18} />
            Mark Attendance
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500">Total Students</h3>
              <Users className="text-blue-500" size={22} />
            </div>
            <p className="text-3xl font-bold text-gray-800">250</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500">Present Today</h3>
              <ClipboardCheck className="text-green-500" size={22} />
            </div>
            <p className="text-3xl font-bold text-green-600">235</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500">Absent Today</h3>
              <Clock className="text-red-500" size={22} />
            </div>
            <p className="text-3xl font-bold text-red-600">15</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500">Attendance Rate</h3>
              <TrendingUp className="text-indigo-500" size={22} />
            </div>
            <p className="text-3xl font-bold text-indigo-600">94%</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Weekly Attendance
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Present percentage from Monday to Friday.
                </p>
              </div>
              <CalendarCheck className="text-blue-500" size={24} />
            </div>
            <AttendanceChartWidget />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Attendance Summary
            </h2>

            <div className="space-y-4">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-gray-500">Best Day</p>
                <h3 className="text-lg font-bold text-green-600">
                  Wednesday (95%)
                </h3>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm text-gray-500">Lowest Day</p>
                <h3 className="text-lg font-bold text-red-600">
                  Tuesday (88%)
                </h3>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-gray-500">Average Attendance</p>
                <h3 className="text-lg font-bold text-blue-600">92%</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Attendance Records
            </h2>
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="Search records..."
                type="text"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3">Student</th>
                  <th className="py-3">Class</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="py-3 font-semibold text-gray-700">John Smith</td>
                  <td>Grade 12</td>
                  <td>09 Jun 2026</td>
                  <td>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      Present
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-gray-700">Emma Watson</td>
                  <td>Grade 11</td>
                  <td>09 Jun 2026</td>
                  <td>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      Absent
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-gray-700">Michael Lee</td>
                  <td>Grade 10</td>
                  <td>09 Jun 2026</td>
                  <td>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      Present
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
