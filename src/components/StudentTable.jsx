import '../styles/StudentTable.css'
import { Eye, Pencil, Trash2 } from "lucide-react";
const students = [
  {
    id: '1',
    image: 'https://i.pravatar.cc/50?img=1',
    name: 'Sok Dara',
    gender: 'Male',
    className: 'Grade 10A',
    status: 'Web Developer',
  },
  {
    id: '2',
    image: 'https://i.pravatar.cc/50?img=2',
    name: 'Chan Lina',
    gender: 'Female',
    className: 'Grade 9B',
    status: 'Cybersecurity',
  },
  {
    id: '3',
    image: 'https://i.pravatar.cc/50?img=3',
    name: 'Nith Vicheka',
    gender: 'Male',
    className: 'Grade 11C',
    status: 'Network',
  },
]

const StudentTable = () => {
  const handleView = (student) => {
    alert(`Viewing ${student.name}`)
  }

  const handleEdit = (student) => {
    alert(`Editing ${student.name}`)
  }

  const handleDelete = (id) => {
    alert(`Deleting ${id}`)
  }

  return (
    <div className="table-wrap">
      <table className="student-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Class</th>
            <th>Subject</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>

              <td>
                <img
                  src={student.image}
                  alt={student.name}
                  className="student-img"
                />
              </td>

              <td>{student.name}</td>
              <td>{student.gender}</td>
              <td>{student.className}</td>

              <td>
                <span
                  className={
                    student.status === 'Active'
                      ? 'status active'
                      : 'status review'
                  }
                >
                  {student.status}
                </span>
              </td>

              <td className="flex gap-2">
                  {/* <button
                    onClick={() => handleView(student)}
                    className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                  >
                    <Eye size={18} />
                  </button> */}

                  <button
                    onClick={() => handleEdit(student)}
                    className="rounded-lg bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(student.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentTable