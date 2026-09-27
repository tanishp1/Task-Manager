import { useEffect, useState } from "react";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import toast from "react-hot-toast";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LuTrash2, LuPlus, LuCheck, LuX, LuPaperclip } from "react-icons/lu";
import { PRIORITY_DATA } from "../../utils/data";
import SelectDropdown from "../../components/inputs/SelectDropdown";
import SelectUsers from "../../components/inputs/SelectUsers";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import uploadImage from "../../utils/uploadImage";
import { UserContext } from "../../context/useContext";

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};

  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const isMember = user?.role !== "admin";

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "low",
    dueDate: "",
    assignedTo: [],
    todoCheckList: [],
    attachment: [],
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [checklistItem, setChecklistItem] = useState("");

  const handleValueChange = (key, value) => {
    setTaskData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "low",
      dueDate: "",
      assignedTo: [],
      todoCheckList: [],
      attachment: [],
    });
  };

  const addChecklistItem = () => {
    const text = checklistItem.trim();
    if (!text) return;
    handleValueChange("todoCheckList", [
      ...taskData.todoCheckList,
      { text, completed: false },
    ]);
    setChecklistItem("");
  };

  const toggleChecklistItem = (index) => {
    const updated = taskData.todoCheckList.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    handleValueChange("todoCheckList", updated);
  };

  const removeChecklistItem = (index) => {
    handleValueChange(
      "todoCheckList",
      taskData.todoCheckList.filter((_, i) => i !== index)
    );
  };

  const handleAttachmentChange = async ({ target }) => {
    if (!target.files?.length) return;
    try {
      setLoading(true);
      const uploads = await Promise.all(
        Array.from(target.files).map((file) => uploadImage(file))
      );
      handleValueChange("attachment", [
        ...taskData.attachment,
        ...uploads.map(({ imageUrl }) => imageUrl),
      ]);
      toast.success("Attachment uploaded successfully!");
    } catch (uploadError) {
      toast.error(uploadError.response?.data?.message || "Unable to upload attachment");
    } finally {
      setLoading(false);
      target.value = "";
    }
  };

  const createTask = async () => {
    const payload = isMember ? { ...taskData, assignedTo: [user._id] } : taskData;
    await Axiosinstance.post(API_PATHS.TASK.CREATE_TASK, payload);
    toast.success("Task created successfully!");
    clearData();
    navigate(isMember ? "/users/tasks" : "/admin/tasks");
  };

  const updateTask = async () => {
    await Axiosinstance.put(API_PATHS.TASK.UPDATE_TASK(taskId), taskData);
    toast.success("Task updated successfully!");
    navigate("/admin/tasks");
  };

  const validateForm = () => {
    const errors = {};
    const today = moment().startOf("day");
    if (!taskData.title.trim()) errors.title = "Task title is required.";
    if (taskData.title.trim().length > 120) errors.title = "Task title must be 120 characters or fewer.";
    if (!taskData.description.trim()) errors.description = "Description is required.";
    if (!taskData.dueDate) errors.dueDate = "Due date is required.";
    else if (moment(taskData.dueDate).isBefore(today, "day")) errors.dueDate = "Due date cannot be in the past.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setError("Please correct the highlighted fields.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (taskId) await updateTask();
      else await createTask();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const taskDetailsById = async () => {
    try {
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_TASK_BY_ID(taskId));
      const task = response.data;
      setTaskData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "low",
        dueDate: task.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : "",
        assignedTo: (task.assignedTo || []).map((u) => u._id || u),
        todoCheckList: task.todoCheckList || [],
        attachment: task.attachment || [],
      });
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to load task");
      navigate("/admin/tasks");
    }
  };

  const deleteTask = async () => {
    try {
      await Axiosinstance.delete(API_PATHS.TASK.DELETE_TASK(taskId));
      toast.success("Task deleted successfully!");
      navigate("/admin/tasks");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to delete task");
    } finally {
      setOpenDeleteAlert(false);
    }
  };

  useEffect(() => {
    if (taskId) taskDetailsById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const completedCount = taskData.todoCheckList.filter((i) => i.completed).length;
  const totalCount = taskData.todoCheckList.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dashboardlayout activeMenu={isMember ? "My Tasks" : "Create Task"}>
      <form onSubmit={handleSubmit} className="mt-5 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {taskId ? "Update Task" : "Create New Task"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {taskId ? "Edit the details below and save your changes." : "Fill in the details below to create a task."}
                </p>
              </div>
              {taskId && (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded-lg px-3 py-2 border border-rose-100 hover:bg-rose-100 hover:border-rose-300 transition-colors cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" />
                  Delete Task
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Task Title</label>
              <input
                placeholder="e.g. Design landing page"
                className="form-input"
                value={taskData.title}
                onChange={({ target }) => handleValueChange("title", target.value)}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <LuX className="shrink-0" /> {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Description</label>
              <textarea
                placeholder="Describe what needs to be done..."
                className="form-input resize-none"
                rows={4}
                value={taskData.description}
                onChange={({ target }) => handleValueChange("description", target.value)}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <LuX className="shrink-0" /> {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Priority + Due Date */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Priority</label>
                <SelectDropdown
                  option={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                  placeholder="Select Priority"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Due Date</label>
                <input
                  className="form-input"
                  value={taskData.dueDate}
                  onChange={({ target }) => handleValueChange("dueDate", target.value)}
                  type="date"
                  min={moment().format("YYYY-MM-DD")}
                />
                {fieldErrors.dueDate && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <LuX className="shrink-0" /> {fieldErrors.dueDate}
                  </p>
                )}
              </div>

              {!isMember && (
                <div className="col-span-12">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Assign To</label>
                  <SelectUsers
                    selectedUsers={taskData.assignedTo}
                    setSelectedUsers={(value) => handleValueChange("assignedTo", value)}
                  />
                  {fieldErrors.assignedTo && (
                    <p className="mt-1 text-xs text-rose-500">{fieldErrors.assignedTo}</p>
                  )}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Checklist
                </label>
                {totalCount > 0 && (
                  <span className="text-xs text-slate-500 font-medium">
                    {completedCount}/{totalCount} done &nbsp;·&nbsp; {progressPct}%
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              {/* Add item input */}
              <div className="flex gap-2">
                <input
                  className="form-input mt-0 flex-1"
                  placeholder="Add a checklist item and press Enter or click Add"
                  value={checklistItem}
                  onChange={({ target }) => setChecklistItem(target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
                />
                <button
                  type="button"
                  className="card-btn shrink-0 gap-1"
                  onClick={addChecklistItem}
                >
                  <LuPlus className="text-sm" /> Add
                </button>
              </div>

              {/* Checklist items */}
              {taskData.todoCheckList.length > 0 && (
                <div className="mt-3 space-y-2">
                  {taskData.todoCheckList.map((item, index) => (
                    <div
                      key={`${item.text}-${index}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-colors hover:border-slate-300"
                    >
                      <button
                        type="button"
                        onClick={() => toggleChecklistItem(index)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                          item.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white hover:border-primary"
                        }`}
                        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {item.completed && <LuCheck className="text-[11px]" />}
                      </button>
                      <span
                        className={`flex-1 text-sm transition-colors ${
                          item.completed ? "text-slate-400 line-through" : "text-slate-700"
                        }`}
                      >
                        {item.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <LuX className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <LuPaperclip className="text-slate-400" /> Attachments
              </label>
              <input
                type="file"
                multiple
                className="form-input cursor-pointer"
                onChange={handleAttachmentChange}
              />
              {taskData.attachment.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {taskData.attachment.map((file, index) => (
                    <div
                      key={file}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                    >
                      <span className="truncate flex items-center gap-2">
                        <LuPaperclip className="shrink-0 text-slate-400" />
                        Attachment {index + 1}
                      </span>
                      <button
                        type="button"
                        className="text-rose-500 hover:text-rose-700 font-medium ml-3 shrink-0"
                        onClick={() =>
                          handleValueChange(
                            "attachment",
                            taskData.attachment.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                <LuX className="shrink-0" /> {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                className="card-btn"
                onClick={() => navigate(isMember ? "/users/tasks" : "/admin/tasks")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-auto px-6"
                disabled={loading}
              >
                {loading ? "Saving..." : taskId ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {openDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mb-4">
              <LuTrash2 className="text-rose-500 text-xl" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Delete this task?</h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              This action is permanent and cannot be undone. All checklist items and attachments will be removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="card-btn"
                onClick={() => setOpenDeleteAlert(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors shadow-sm"
                onClick={deleteTask}
              >
                <LuTrash2 /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboardlayout>
  );
};

export default CreateTask;
