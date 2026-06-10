import { useState } from "react"

const scoreRows = [
  {
    id: "ST001",
    student: "Sok Dara",
    className: "Grade 10A",
    khmer: 10,
    math: 10,
    english: 10,
    biology: 18,
    physics: 14,
    chemistry: 17,
    history: 11,
  },
  {
    id: "ST002",
    student: "Chan Lina",
    className: "Grade 9B",
    khmer: 89,
    math: 84,
    english: 87,
    biology: 91,
    physics: 82,
    chemistry: 86,
    history: 88,
  },
  {
    id: "ST003",
    student: "Nith Vicheka",
    className: "Grade 11C",
    khmer: 80,
    math: 78,
    english: 85,
    biology: 82,
    physics: 79,
    chemistry: 81,
    history: 84,
  },
]

const Scores = () => {
  const [selectedClass, setSelectedClass] = useState("All Classes")

  const filteredRows =
    selectedClass === "All Classes"
      ? scoreRows
      : scoreRows.filter((row) => row.className === selectedClass)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Student Scores
          </h1>
          <p className="text-slate-500">
            Manage and monitor student academic performance
          </p>
        </div>

        <button className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-lg transition hover:bg-blue-700">
          + Add Score
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Students</p>
          <h2 className="mt-2 text-3xl font-bold">320</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average Score</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">86%</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Top Subject</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">Biology</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Need Review</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">12</h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="border-b p-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Examination Results
          </h2>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Classes">All Classes</option>
            <option value="Grade 9B">Grade 9B</option>
            <option value="Grade 10A">Grade 10A</option>
            <option value="Grade 11C">Grade 11C</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Student Name</th>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3">Khmer</th>
                <th className="px-4 py-3">Math</th>
                <th className="px-4 py-3">English</th>
                <th className="px-4 py-3">Biology</th>
                <th className="px-4 py-3">Physics</th>
                <th className="px-4 py-3">Chemistry</th>
                <th className="px-4 py-3">History</th>
                <th className="px-4 py-3">Average</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => {
                const average = Math.round(
                  (row.khmer +
                    row.math +
                    row.english +
                    row.biology +
                    row.physics +
                    row.chemistry +
                    row.history) / 7
                )

                const grade =
                    average >= 90
                      ? "A"
                      : average >= 80
                      ? "B"
                      : average >= 70
                      ? "C"
                      : average >= 60
                      ? "D"
                      : average >= 50
                      ? "E"
                      : "F"

                return (
                  <tr key={row.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{row.id}</td>
                    <td className="px-4 py-3">{row.student}</td>
                    <td className="px-4 py-3">{row.className}</td>
                    <td className="px-4 py-3 text-center">{row.khmer}</td>
                    <td className="px-4 py-3 text-center">{row.math}</td>
                    <td className="px-4 py-3 text-center">{row.english}</td>
                    <td className="px-4 py-3 text-center">{row.biology}</td>
                    <td className="px-4 py-3 text-center">{row.physics}</td>
                    <td className="px-4 py-3 text-center">{row.chemistry}</td>
                    <td className="px-4 py-3 text-center">{row.history}</td>

                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                        {average}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-3 py-1 font-semibold ${
                          grade === "A"
                            ? "bg-green-100 text-green-700"
                            : grade === "B"
                            ? "bg-blue-100 text-blue-700"
                            : grade === "C"
                            ? "bg-yellow-100 text-yellow-700"
                            : grade === "D"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Scores