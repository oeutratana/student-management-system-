import StudentTable from "../components/StudentTable";

const Students = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Student Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage students, search records and update information.
            </p>
          </div>

          <button
              onClick={() => onNavigate('AddStudent')}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-white"
            >
              + Add Student
            </button>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-md">
            <h3 className="text-sm text-gray-500">Total Students</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">120</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <h3 className="text-sm text-gray-500">Active Students</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">98</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <h3 className="text-sm text-gray-500">Pending Review</h3>
            <p className="mt-2 text-3xl font-bold text-orange-500">22</p>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">

          {/* Search + Filter */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-4 top-3.5 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search student..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500">
              <option>All Classes</option>
              <option>Grade 9</option>
              <option>Grade 10</option>
              <option>Grade 11</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <StudentTable />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Students;