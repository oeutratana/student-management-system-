import {
  Bell,
  Mail,
  Search,
  School,
  Users,
  Settings,
  BookOpen,
  ClipboardCheck,
  UserCircle,
} from "lucide-react";

const stats = [
  {
    title: "Schools",
    value: "6000",
    color: "border-pink-400",
    icon: <School className="text-pink-400" />,
  },
  {
    title: "Students",
    value: "24542",
    color: "border-purple-500",
    icon: <Users className="text-purple-500" />,
  },
  {
    title: "Teachers",
    value: "5000",
    color: "border-yellow-400",
    icon: <ClipboardCheck className="text-yellow-400" />,
  },
  {
    title: "Parents",
    value: "10000",
    color: "border-green-500",
    icon: <UserCircle className="text-green-500" />,
  },
];

const menu = [
  "Dashboard",
  "Students",
  "Teachers",
  "Parents",
  "Library",
  "Attendance",
  "Exam",
  "Hostel",
  "Account",
  "Settings",
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f5f4fa] flex">
      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mt-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`bg-white rounded-3xl p-6 border-l-4 ${stat.color} shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)]`}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 grid place-items-center">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Left Side */}
          <div className="col-span-7 space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between mb-6">
                <h2 className="font-semibold">
                  Calendar & Attendance
                </h2>
                <span className="text-gray-500">
                  02 October, 2019
                </span>
              </div>

              <div className="grid grid-cols-7 gap-3 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  )
                )}

                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 flex items-center justify-center rounded-full ${
                      i === 10
                        ? "bg-green-500 text-white"
                        : i === 24
                        ? "bg-yellow-400 text-white"
                        : i >= 30 && i <= 32
                        ? "bg-green-400 text-white"
                        : ""
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between">
                <h2 className="font-semibold">
                  Activities Notification
                </h2>

                <button className="border border-green-500 text-green-500 px-4 py-1 rounded-full text-sm">
                  View All
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="border-b pb-4 last:border-none"
                  >
                    <h3 className="font-medium">
                      St.Xavier School
                    </h3>
                    <p className="text-sm text-gray-400">
                      02 Oct, 2019
                    </p>

                    <p className="text-gray-500 text-sm mt-2">
                      We are planning to celebrate Gandhi
                      Jayanti in our school. Parents and
                      teachers are invited.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="col-span-5 space-y-6">
            {/* School Performance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold mb-4">
                School Performance
              </h2>

              <div className="flex justify-center items-end gap-10 h-56">
                <div className="w-12 h-40 bg-purple-500 rounded-t-lg"></div>
                <div className="w-12 h-28 bg-yellow-400 rounded-t-lg"></div>
                <div className="w-12 h-36 bg-green-500 rounded-t-lg"></div>
              </div>
            </div>

            {/* Top Scorer */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between mb-5">
                <h2 className="font-semibold">Top Scorer</h2>

                <select className="border rounded-lg px-3 py-1">
                  <option>2018-2019</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    name: "Branden Harris",
                    score: "99.90%",
                    bg: "bg-green-500",
                    rank: "1st",
                  },
                  {
                    name: "Charles James",
                    score: "99.76%",
                    bg: "bg-purple-500",
                    rank: "2nd",
                  },
                  {
                    name: "Mike Peter",
                    score: "99.50%",
                    bg: "bg-yellow-400",
                    rank: "3rd",
                  },
                ].map((student) => (
                  <div
                    key={student.name}
                    className={`${student.bg} text-white rounded-xl p-4 text-center`}
                  >
                    <UserCircle
                      size={48}
                      className="mx-auto mb-3"
                    />
                    <h4 className="text-sm font-medium">
                      {student.name}
                    </h4>
                    <div className="text-3xl font-bold my-3">
                      {student.score}
                    </div>
                    <div className="bg-white/20 rounded-lg py-2">
                      {student.rank}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fees Structure */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold mb-4">
                Schools Fees Structure
              </h2>

              <div className="h-48 flex items-end gap-5 justify-center">
                <div className="w-10 bg-purple-500 h-36 rounded-t"></div>
                <div className="w-10 bg-yellow-400 h-24 rounded-t"></div>
                <div className="w-10 bg-green-500 h-40 rounded-t"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}