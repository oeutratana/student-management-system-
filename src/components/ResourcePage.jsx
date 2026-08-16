import { useCallback, useEffect, useMemo, useState } from "react"
import { Inbox, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"

const emptyValue = (field) => field.defaultValue ?? ""

const getNestedValue = (item, path) =>
  path.split(".").reduce((value, key) => value?.[key], item)

const normalize = (value) => String(value ?? "").toLowerCase()

const buildInitialForm = (fields) =>
  fields.reduce((form, field) => ({ ...form, [field.name]: emptyValue(field) }), {})

const formatValue = (item, column) => {
  const value = column.render ? column.render(item) : getNestedValue(item, column.key)
  return value === undefined || value === null || value === "" ? "-" : value
}

export default function ResourcePage({ title, description, api, fields, columns, searchKeys = [] }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(buildInitialForm(fields))
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [options, setOptions] = useState({})

  const loadOptions = useCallback(async () => {
    const entries = await Promise.all(
      fields
        .filter((field) => field.loadOptions)
        .map(async (field) => {
          try {
            return [field.name, await field.loadOptions()]
          } catch {
            return [field.name, []]
          }
        }),
    )

    setOptions(Object.fromEntries(entries))
  }, [fields])

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setItems(await api.list())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems()
    loadOptions()
  }, [loadItems, loadOptions])

  const filteredItems = useMemo(() => {
    if (!search) {
      return items
    }

    return items.filter((item) =>
      searchKeys.some((key) => normalize(getNestedValue(item, key)).includes(normalize(search))),
    )
  }, [items, search, searchKeys])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const resetForm = () => {
    setForm(buildInitialForm(fields))
    setEditing(null)
  }

  const handleEdit = (item) => {
    const nextForm = fields.reduce((current, field) => {
      current[field.name] = getNestedValue(item, field.name) ?? emptyValue(field)
      return current
    }, {})

    setEditing(item)
    setForm(nextForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    const payload = fields.reduce((data, field) => {
      if (field.type === "password" && editing && !form[field.name]) {
        return data
      }
      data[field.name] = field.type === "number" ? Number(form[field.name] || 0) : form[field.name]
      return data
    }, {})

    try {
      if (editing) {
        await api.update(editing.id, payload)
      } else {
        await api.create(payload)
      }
      resetForm()
      await loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${title.slice(0, -1).toLowerCase()} #${item.id}?`)) {
      return
    }

    setError("")
    try {
      await api.remove(item.id)
      await loadItems()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="resource-page">
      <div className="resource-header">
        <div>
          <p className="eyebrow">API Resource</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="secondary-button icon-button" onClick={loadItems} type="button">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="resource-grid">
        <section className="panel">
          <div className="section-title">
            <h2>{editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</h2>
            {editing && (
              <button className="ghost-button" onClick={resetForm} type="button">
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          <form className="api-form" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <label key={field.name}>
                {field.label}
                {field.type === "select" ? (
                  <select name={field.name} onChange={handleChange} required={field.required} value={form[field.name]}>
                    <option value="">Select {field.label}</option>
                    {(field.options || options[field.name] || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea name={field.name} onChange={handleChange} value={form[field.name]} />
                ) : (
                  <input
                    name={field.name}
                    onChange={handleChange}
                    required={field.required && !(editing && field.type === "password")}
                    type={field.type || "text"}
                    value={form[field.name]}
                  />
                )}
              </label>
            ))}
            <button className="primary-button icon-button" disabled={saving} type="submit">
              <Plus size={18} />
              {saving ? "Saving..." : editing ? "Save Changes" : `Create ${title.slice(0, -1)}`}
            </button>
          </form>
        </section>

        <section className="panel table-panel">
          <div className="section-title">
            <h2>{title} List</h2>
            <div className="section-title__search">
              <Search size={16} />
              <input
                aria-label={`Search ${title}`}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                value={search}
              />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1}>
                      <div className="empty-state">Loading...</div>
                    </td>
                  </tr>
                ) : filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      {columns.map((column) => (
                        <td key={column.key}>{formatValue(item, column)}</td>
                      ))}
                      <td>
                        <div className="action-row">
                          <button className="icon-only" onClick={() => handleEdit(item)} title="Edit" type="button">
                            <Pencil size={16} />
                          </button>
                          <button className="icon-only danger" onClick={() => handleDelete(item)} title="Delete" type="button">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1}>
                      <div className="empty-state">
                        <Inbox size={32} />
                        No records found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
