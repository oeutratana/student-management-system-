import ResourcePage from "../components/ResourcePage"
import { teachersApi, usersApi, toOptions } from "../services/schoolApi"

export default function Teachers() {
  return (
    <ResourcePage
      api={teachersApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Name", render: (item) => item.name ?? item.user?.name ?? "-" },
        { key: "subject", label: "Subject" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status", render: (item) => (
          <span className={`badge ${item.status === "Active" ? "badge--green" : "badge--orange"}`}>{item.status ?? "Active"}</span>
        ) },
      ]}
      description="Manage teacher profiles, subjects and contact information."
      fields={[
        { name: "user_id", label: "User Account", type: "select", loadOptions: () => usersApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "name", label: "Name" },
        { name: "subject", label: "Subject", required: true },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "status", label: "Status", type: "select", options: [
          { value: "Active", label: "Active" },
          { value: "On Leave", label: "On Leave" },
        ] },
      ]}
      searchKeys={["name", "subject", "email"]}
      title="Teachers"
    />
  )
}
