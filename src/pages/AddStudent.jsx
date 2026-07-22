import { useNavigate } from "react-router-dom";

const AddStudent = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          
            <button
              onClick={() => navigate('/students')}
              className="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-100"
              type="button"
            >
              ← Back
            </button>
            <h2 className="mb-6 text-2xl font-bold text-gray-800 text-center">Add Student</h2>
          <form className="grid gap-4 md:grid-cols-2">
        {/* ID */}
        <div>
          <label className="mb-2 block font-medium">Student ID</label>
          <input
            type="text"
            placeholder="Enter ID"
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Name */}
        <div>
          <label className="mb-2 block font-medium">Full Name</label>
          <input
            type="text"
            placeholder="Enter name"
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="mb-2 block font-medium">Gender</label>
          <select className="w-full rounded-xl border p-3 outline-none focus:border-blue-500">
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        {/* Class */}
        <div>
          <label className="mb-2 block font-medium">Class</label>
          <input
            type="text"
            placeholder="Grade 10A"
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="mb-2 block font-medium">Subject</label>
          <select className="w-full rounded-xl border p-3 outline-none focus:border-blue-500">
            <option>Web Developer</option>
            <option>Cybersecurity</option>
            <option>Network</option>
          </select>
        </div>

        {/* Image */}
        <div>
          <label className="mb-2 block font-medium">Student Image</label>
          <input
            type="file"
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Buttons */}
        <div className="col-span-2 flex justify-end gap-3 pt-4">
          <button
            type="reset"
            className="rounded-xl border px-5 py-3"
          >
            Reset
          </button>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Save Student
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  )
}

export default AddStudent
