import { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LuArrowLeft,
  LuCalendarDays,
  LuCheck,
  LuClipboardList,
  LuPaperclip,
} from "react-icons/lu";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { useUserAuth } from "../../hooks/useUserAuth";

const ViewsDetails = () => {
  useUserAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingChecklist, setSavingChecklist] = useState(false);

  const getTaskDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_TASK_BY_ID(id));
      setTask(response.data);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load task details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getTaskDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleChecklistItem = async (itemIndex) => {
    if (!task) return;
    const wasCompleted = task.todoCheckList[itemIndex]?.completed;
    const todoCheckList = task.todoCheckList.map((item, index) =>
      index === itemIndex ? { ...item, completed: !item.completed } : item
    );
    try {
      setSavingChecklist(true);
      const response = await Axiosinstance.put(
        API_PATHS.TASK.UPDATE_TODO_CHECKLIST(id),
        { todoCheckList }
      );
      setTask(response.data.task);
      toast.success(wasCompleted ? "Item marked incomplete" : "Item marked complete!");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update checklist.");
    } finally {
      setSavingChecklist(false);
    }
  };

  const statusStyle = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Pending: "bg-amber-50 text-amber-600 border-amber-200",
    "In Progress": "bg-cyan-50 text-cyan-600 border-cyan-200",
  }[task?.status] || "bg-slate-50 text-slate-600 border-slate-200";

  const priorityStyle = {
    high: "bg-rose-50 text-rose-600 border-rose-200",
    medium: "bg-orange-50 text-orange-600 border-orange-200",
    low: "bg-slate-50 text-slate-500 border-slate-200",
  }[task?.priority] || "bg-slate-50 text-slate-500 border-slate-200";

  const completedCount = task?.todoCheckList?.filter((i) => i.completed).length || 0;
  const totalCount = task?.todoCheckList?.length || 0;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dashboardlayout activeMenu="My Tasks">
      <div className="mx-auto mt-5 max-w-3xl pb-10">
        <button
          type="button"
          className="card-btn mb-5"
          onClick={() => navigate("/users/tasks")}
        >
          <LuArrowLeft /> Back to tasks
        </button>

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-slate-500">Loading task details...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-rose-500">{error}</p>
            <button type="button" className="card-btn mx-auto mt-3" onClick={getTaskDetails}>
              Try again
            </button>
          </div>
        ) : task ? (
          <div className="space-y-4">

            {/* Task header card */}
            <section className="card">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase ${priorityStyle}`}>
                  {task.priority || "medium"} priority
                </span>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyle}`}>
                  {task.status}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 leading-snug">{task.title}</h1>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-500">
                {task.description || "No description provided."}
              </p>

              <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-500 sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <LuCalendarDays className="text-slate-400" />
                  Created: {task.createdAt ? moment(task.createdAt).format("DD MMM YYYY") : "—"}
                </span>
                <span className="flex items-center gap-2">
                  <LuCalendarDays className="text-slate-400" />
                  Due: {task.dueDate ? moment(task.dueDate).format("DD MMM YYYY") : "No due date"}
                </span>
              </div>
            </section>

            {/* Checklist card */}
            <section className="card">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <LuClipboardList className="text-primary text-lg" />
                  <h2 className="font-semibold text-slate-800">Checklist</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">
                    {completedCount}/{totalCount} done
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      progressPct === 100
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-50 text-primary"
                    }`}
                  >
                    {progressPct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPct === 100 ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              {task.todoCheckList?.length ? (
                <div className="space-y-2">
                  {task.todoCheckList.map((item, index) => (
                    <button
                      key={item._id || `${item.text}-${index}`}
                      type="button"
                      disabled={savingChecklist}
                      onClick={() => toggleChecklistItem(index)}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        item.completed
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-slate-200 bg-white hover:border-primary/40 hover:bg-blue-50/30"
                      } ${savingChecklist ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {/* Custom checkbox */}
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                          item.completed
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {item.completed && <LuCheck className="text-white text-[11px]" />}
                      </span>

                      <span
                        className={`flex-1 text-sm font-medium transition-colors ${
                          item.completed ? "text-slate-400 line-through" : "text-slate-700"
                        }`}
                      >
                        {item.text}
                      </span>

                      {item.completed && (
                        <span className="shrink-0 text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Done
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <LuClipboardList className="mx-auto mb-2 text-2xl text-slate-300" />
                  <p className="text-sm text-slate-400">No checklist items for this task.</p>
                </div>
              )}
            </section>

            {/* Attachments card */}
            {task.attachment?.length ? (
              <section className="card">
                <div className="flex items-center gap-2 mb-4">
                  <LuPaperclip className="text-primary text-lg" />
                  <h2 className="font-semibold text-slate-800">Attachments</h2>
                  <span className="ml-auto text-xs text-slate-400">{task.attachment.length} file{task.attachment.length > 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {task.attachment.map((attachment, index) => (
                    <a
                      key={`${attachment}-${index}`}
                      href={attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primary hover:bg-blue-50 hover:border-primary/30 transition-colors"
                    >
                      <LuPaperclip className="shrink-0 text-slate-400" />
                      <span className="truncate">Attachment {index + 1}</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

          </div>
        ) : null}
      </div>
    </Dashboardlayout>
  );
};

export default ViewsDetails;
