import { useState } from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"

const initialTeachers = [
  {
    id: 1,
    name: "Dina Roth",
    subject: "Mathematics",
    classes: "10A, 11C",
    status: "Active",
    image: "https://i.pravatar.cc/150?img=32"
  },
  {
    id: 2,
    name: "Mey Sopheak",
    subject: "Science",
    classes: "9B, 10A",
    status: "Active",
    image: "https://i.pravatar.cc/150?img=12"
  },
  {
    id: 3,
    name: "Lina Chen",
    subject: "English",
    classes: "9B, 11C",
    status: "On Leave",
    image: "https://i.pravatar.cc/150?img=47"
  },
]

const Teachers = ({ onNavigate }) => {
  const [teachers, setTeachers] = useState(initialTeachers)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState({
    id: null,
    name: "",
    subject: "",
    classes: "",
    status: "Active",
    image: ""
  })

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())

    const matchFilter = filter === "All" || t.subject === filter

    return matchSearch && matchFilter
  })


  const openEditModal = (teacher) => {
    setForm(teacher)
    setIsEdit(true)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (isEdit) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === form.id ? form : t))
      )
    } else {
      setTeachers((prev) => [
        ...prev,
        { ...form, id: Date.now() },
      ])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    const ok = window.confirm("Delete this teacher?")
    if (ok) setTeachers((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Teachers</h2>
            <p className="text-gray-500">
              Manage teacher profiles, subjects, and classes.
            </p>
          </div>

          <button
              onClick={() => onNavigate("AddTeacher")}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-white shadow-md hover:bg-blue-700"
            >
              + Add Teacher
            </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher..."
            className="w-full max-w-sm rounded-xl border px-4 py-2"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border px-4 py-2"
          >
            <option value="All">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl bg-white shadow-lg">
          <table className="w-full text-left">

            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="px-6 py-4">Teacher</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Classes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">

                  {/* TEACHER (IMAGE + NAME) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">

                      {teacher.image ? (
                        <img
                          src={teacher.image}
                          alt={teacher.name}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {teacher.name.charAt(0)}
                        </div>
                      )}

                      <span className="font-medium text-gray-800">
                        {teacher.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {teacher.subject}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {teacher.classes}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      teacher.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {teacher.status}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-center">
                    <div className="mx-auto flex w-fit items-center gap-2">

                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => openEditModal(teacher)}
                        className="rounded-lg border p-2 text-yellow-600 hover:bg-yellow-50"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(teacher.id)}
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

        {/* VIEW MODAL */}
        {selectedTeacher && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-2xl bg-white p-6 text-center">

              <img
                src={selectedTeacher.image}
                className="mx-auto mb-3 h-20 w-20 rounded-full object-cover"
              />

              <h2 className="text-xl font-bold">
                {selectedTeacher.name}
              </h2>

              <p className="text-gray-500">{selectedTeacher.subject}</p>

              <p className="mt-2"><b>Classes:</b> {selectedTeacher.classes}</p>
              <p><b>Status:</b> {selectedTeacher.status}</p>

              <button
                onClick={() => setSelectedTeacher(null)}
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
                {isEdit ? "Edit Teacher" : "Add Teacher"}
              </h2>

              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="mb-2 w-full rounded border p-2"
              />

              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Subject"
                className="mb-2 w-full rounded border p-2"
              />

              <input
                value={form.classes}
                onChange={(e) => setForm({ ...form, classes: e.target.value })}
                placeholder="Classes"
                className="mb-2 w-full rounded border p-2"
              />

              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Image URL"
                className="mb-2 w-full rounded border p-2"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mb-4 w-full rounded border p-2"
              >
                <option>Active</option>
                <option>On Leave</option>
              </select>

              <button
                onClick={handleSave}
                className="w-full rounded bg-blue-600 py-2 text-white"
              >
                Save
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Teachers