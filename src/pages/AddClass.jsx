import { useState } from "react"

const AddClass = () => {
  const [form, setForm] = useState({
    name: "",
    teacher: "",
    students: "",
    room: "",
    status: "Active",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("New Class:", form)
    alert("Class added successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-lg">

        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Add New Class
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Class Name (e.g. Grade 10A)"
            className="w-full rounded-lg border p-3"
          />

          <input
            name="teacher"
            value={form.teacher}
            onChange={handleChange}
            placeholder="Teacher Name"
            className="w-full rounded-lg border p-3"
          />

          <input
            name="students"
            value={form.students}
            onChange={handleChange}
            placeholder="Number of Students"
            className="w-full rounded-lg border p-3"
          />

          <input
            name="room"
            value={form.room}
            onChange={handleChange}
            placeholder="Room Number"
            className="w-full rounded-lg border p-3"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
          >
            Save Class
          </button>

        </form>
      </div>
    </div>
  )
}

export default AddClass