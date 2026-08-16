import ResourcePage from "../components/ResourcePage"
import { studentsApi, classesApi, toOptions } from "../services/schoolApi"

export default function Students() {
  return (
    <ResourcePage
      api={studentsApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "student_code", label: "Code" },
        { key: "name", label: "Name", render: (item) => `${item.first_name} ${item.last_name}` },
        { key: "gender", label: "Gender" },
        { key: "class", label: "Class", render: (item) => item.class?.class_name ?? "-" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
      description="Manage student profiles, enrollment class and contact information."
      fields={[
        { name: "class_id", label: "Class", type: "select", required: true, loadOptions: () => classesApi.list().then((rows) => toOptions(rows, "class_name")) },
        { name: "student_code", label: "Student Code", required: true },
        { name: "first_name", label: "First Name", required: true },
        { name: "last_name", label: "Last Name", required: true },
        { name: "gender", label: "Gender", type: "select", required: true, options: [
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ] },
        { name: "dob", label: "Date of Birth", type: "date", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "image", label: "Image URL" },
      ]}
      searchKeys={["first_name", "last_name", "student_code", "email"]}
      title="Students"
    />
  )
}
