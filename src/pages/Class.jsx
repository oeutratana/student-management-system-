import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Pencil, Trash2 } from "lucide-react"

const initialClasses = [
  { id: 1, name: "Grade 10A", teacher: "Dina Roth", students: 32, room: "Room 101", status: "Active" },
  { id: 2, name: "Grade 9B", teacher: "Mey Sopheak", students: 28, room: "Room 203", status: "Active" },
  { id: 3, name: "Grade 11C", teacher: "Lina Chen", students: 25, room: "Room 105", status: "Inactive" },
]

const Class = () => {
  const navigate = useNavigate()

  const [classes, setClasses] = useState(initialClasses)
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState({
    id: null,
    name: "",
    teacher: "",
    students: "",
    room: "",
    status: "Active",
  })

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  )

  const openEditModal = (classItem) => {
    setForm(classItem)
    setIsEdit(true)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.teacher || !form.students || !form.room) {
      alert("Please fill in all fields")
      return
    }
    if (isEdit) {
      setClasses((prev) =>
        prev.map((c) => (c.id === form.id ? form : c))
      )
    } else {
      setClasses((prev) => [
        ...prev,
        { ...form, id: Date.now() },
      ])
    }
    setIsModalOpen(false)
    setForm({ id: null, name: "", teacher: "", students: "", room: "", status: "Active" })
  }

  const handleDelete = (id) => {
    const ok = window.confirm("Delete this class?")
    if (ok) setClasses((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Classes</h1>
            <p className="text-gray-500">Manage school classes and assignments</p>
          </div>

          <button
            onClick={() => navigate("/add-class")}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-white shadow-md hover:bg-blue-700"
          >
            + Add Class
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class or teacher..."
            className="w-full max-w-sm rounded-xl border px-4 py-2"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl bg-white shadow-lg">
          <table className="w-full text-left">

            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Teacher</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">

                  <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.teacher}</td>
                  <td className="px-6 py-4 text-gray-600">{c.students}</td>
                  <td className="px-6 py-4 text-gray-600">{c.room}</td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => setSelectedClass(c)}
                        className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => openEditModal(c)}
                        className="rounded-lg border p-2 text-yellow-600 hover:bg-yellow-50"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(c.id)}
                        className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* MODAL */}
        {selectedClass && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-2xl bg-white p-6 text-center">

              <h2 className="text-xl font-bold">{selectedClass.name}</h2>
              <p className="text-gray-500 mt-2">Teacher: {selectedClass.teacher}</p>
              <p className="mt-2">Students: {selectedClass.students}</p>
              <p>Room: {selectedClass.room}</p>
              <p>Status: {selectedClass.status}</p>

              <button
                onClick={() => setSelectedClass(null)}
                className="mt-4 w-full rounded bg-blue-600 py-2 text-white"
              >
                Close
              </button>

            </div>
          </div>
        )}

        {/* ADD / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-2xl bg-white p-6">

              <h2 className="mb-4 text-xl font-bold">
                {isEdit ? "Edit Class" : "Add Class"}
              </h2>

              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Class Name (e.g. Grade 10A)"
                className="mb-2 w-full rounded border p-2"
              />

              <input
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                placeholder="Teacher Name"
                className="mb-2 w-full rounded border p-2"
              />

              <input
                value={form.students}
                onChange={(e) => setForm({ ...form, students: e.target.value })}
                placeholder="Number of Students"
                className="mb-2 w-full rounded border p-2"
              />

              <input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="Room Number"
                className="mb-2 w-full rounded border p-2"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mb-4 w-full rounded border p-2"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded bg-blue-600 py-2 text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setForm({ id: null, name: "", teacher: "", students: "", room: "", status: "Active" })
                  }}
                  className="flex-1 rounded bg-gray-300 py-2 text-gray-700"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Class