import moment from "moment";

const TaskListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Pending": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "In Progress": return "bg-blue-50 text-blue-700 border border-blue-200";
      default: return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "high": return "bg-rose-50 text-rose-700 border border-rose-200";
      case "medium": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "low": return "bg-slate-50 text-slate-600 border border-slate-200";
      default: return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl mt-4 border border-slate-100">
      <table className="min-w-full">
        <thead>
          <tr style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tableData.map((task, idx) => (
            <tr
              key={task._id}
              className="transition-colors hover:bg-blue-50/40"
              style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafbfc' }}
            >
              <td className="py-3.5 px-4 text-slate-700 text-[13px] font-medium max-w-[200px] truncate">
                {task.title}
              </td>
              <td className="py-3.5 px-4">
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full inline-block ${getStatusBadgeColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full inline-block capitalize ${getPriorityBadgeColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-3.5 px-4 text-slate-500 text-[12px] whitespace-nowrap hidden md:table-cell">
                {task.createdAt ? moment(task.createdAt).format("Do MMM YYYY") : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;
