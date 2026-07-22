import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Save,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const students = [
  { id: "ST-001", name: "John Smith", className: "Grade 12A", status: "present" },
  { id: "ST-002", name: "Emma Watson", className: "Grade 12A", status: "absent" },
  { id: "ST-003", name: "Michael Lee", className: "Grade 12A", status: "present" },
  { id: "ST-004", name: "Sophia Brown", className: "Grade 12A", status: "late" },
  { id: "ST-005", name: "Daniel Kim", className: "Grade 12A", status: "present" },
];

const statusStyles = {
  present: "border-green-200 bg-green-50 text-green-700",
  absent: "border-red-200 bg-red-50 text-red-700",
  late: "border-amber-200 bg-amber-50 text-amber-700",
};

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState(students);

  const totals = useMemo(
    () => ({
      present: records.filter((record) => record.status === "present").length,
      absent: records.filter((record) => record.status === "absent").length,
      late: records.filter((record) => record.status === "late").length,
    }),
    [records],
  );

  const updateStatus = (id, status) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === id ? { ...record, status } : record,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <button
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => navigate("/attendance")}
            type="button"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-blue-600">
                Daily Roll Call
              </p>
              <h1 className="mt-1 text-3xl font-bold text-gray-800">
                Mark Attendance
              </h1>
              <p className="mt-2 text-gray-500">
                Select class, date and update each student status.
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-blue-700"
              type="button"
            >
              <Save size={18} />
              Save Attendance
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-4">
          <label className="rounded-2xl bg-white p-4 shadow-md">
            <span className="mb-2 block text-sm font-semibold text-gray-600">
              Class
            </span>
            <select className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500">
              <option>Grade 12A</option>
              <option>Grade 11B</option>
              <option>Grade 10A</option>
            </select>
          </label>

          <label className="rounded-2xl bg-white p-4 shadow-md">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-600">
              <CalendarDays size={16} />
              Date
            </span>
            <input
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500"
              defaultValue="2026-06-12"
              type="date"
            />
          </label>

          <label className="rounded-2xl bg-white p-4 shadow-md">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Clock size={16} />
              Session
            </span>
            <select className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500">
              <option>Morning</option>
              <option>Afternoon</option>
            </select>
          </label>

          <div className="rounded-2xl bg-white p-4 shadow-md">
            <span className="mb-2 block text-sm font-semibold text-gray-600">
              Summary
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
              <span className="rounded-lg bg-green-50 px-2 py-3 text-green-700">
                {totals.present} P
              </span>
              <span className="rounded-lg bg-red-50 px-2 py-3 text-red-700">
                {totals.absent} A
              </span>
              <span className="rounded-lg bg-amber-50 px-2 py-3 text-amber-700">
                {totals.late} L
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-gray-800">Student List</h2>
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Search student..."
                type="text"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="font-semibold text-gray-700">{record.id}</td>
                    <td>{record.name}</td>
                    <td>{record.className}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {["present", "absent", "late"].map((status) => (
                          <button
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold capitalize ${
                              record.status === status
                                ? statusStyles[status]
                                : "border-gray-200 bg-white text-gray-500"
                            }`}
                            key={status}
                            onClick={() => updateStatus(record.id, status)}
                            type="button"
                          >
                            {status === "present" && <Check size={14} />}
                            {status === "absent" && <X size={14} />}
                            {status === "late" && <Clock size={14} />}
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
