const AttendanceChart = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Attendance Dashboard
            </h1>
            <p className="text-gray-500">
              Monitor student attendance records and statistics.
            </p>
          </div>

          <button className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-md transition hover:bg-blue-700">
            + Mark Attendance
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h3 className="text-sm text-gray-500">Total Students</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">250</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h3 className="text-sm text-gray-500">Present Today</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">235</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h3 className="text-sm text-gray-500">Absent Today</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">15</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h3 className="text-sm text-gray-500">Attendance Rate</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">94%</p>
          </div>
        </div>

        {/* Chart & Recent Attendance */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="rounded-2xl bg-white p-6 shadow-lg lg:col-span-2">
            <h2 className="mb-6 text-xl font-bold text-gray-800">
              Weekly Attendance
            </h2>

            <AttendanceChart />
          </div>

          {/* Summary */}
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

        {/* Attendance Table */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Recent Attendance Records
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3">Student</th>
                  <th className="py-3">Class</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="py-3">John Smith</td>
                  <td>Grade 12</td>
                  <td>09 Jun 2026</td>
                  <td>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      Present
                    </span>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Emma Watson</td>
                  <td>Grade 11</td>
                  <td>09 Jun 2026</td>
                  <td>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                      Absent
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3">Michael Lee</td>
                  <td>Grade 10</td>
                  <td>09 Jun 2026</td>
                  <td>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
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

export default AttendanceChart;