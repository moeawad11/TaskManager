import { useEffect, useState, createContext, useContext } from "react";
import "./App.css";

const TaskContext = createContext();

const TaskComponent = () => {
  const [inputVal, setInputVal] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(0);
  const { taskManager, setTaskManager, deleteTask } = useContext(TaskContext);

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setInputVal(task.category);
  };

  const handleSave = (taskId) => {
    if (!inputVal.trim()) return;
    setTaskManager(
      taskManager.map((t) =>
        t.id === taskId ? { ...t, category: inputVal.trim() } : t
      )
    );
    setEditingTaskId(0);
  };

  if (!taskManager.length) {
    return (
      <div className="empty-state">No tasks yet. Add your first task!</div>
    );
  }

  return (
    <ul className="task-list">
      {taskManager.map((task) => {
        return (
          <li
            key={task.id}
            className={`task-item ${
              editingTaskId === task.id ? "editing" : ""
            }`}
          >
            {editingTaskId !== task.id ? (
              <>
                <input
                  className="task-checkbox"
                  type="checkbox"
                  onChange={() =>
                    setTaskManager(
                      taskManager.map((t) =>
                        t.id === task.id ? { ...t, completed: !t.completed } : t
                      )
                    )
                  }
                  checked={task.completed}
                />
                <span className="task-text">{task.category}</span>
                <span className="task-date">{task.date}</span>
                <div>
                  <button
                    onClick={() => handleEdit(task)}
                    className="btn btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Edit the task..."
                  className="task-input"
                />
                <div>
                  <button
                    className="btn btn-cancel"
                    onClick={() => setEditingTaskId(0)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(task.id)}
                    className="btn btn-save"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};

function AddTask() {
  const [inputVal, setInputVal] = useState("");
  const { hideAddBtn, setHideAddBtn, taskManager, setTaskManager } =
    useContext(TaskContext);

  const handleSubmit = () => {
    if (!inputVal.trim()) return;

    const newId = taskManager.length
      ? Math.max(...taskManager.map((t) => t.id)) + 1
      : 1;

    setTaskManager([
      ...taskManager,
      {
        id: newId,
        category: inputVal.trim(),
        completed: false,
        date: new Date().toLocaleString(),
      },
    ]);
    setInputVal("");
    setHideAddBtn(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="add-task-section">
      {hideAddBtn && (
        <>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter category..."
            className="add-task-input"
            autoFocus
          />
          <div>
            <button
              className="btn btn-cancel"
              onClick={() => setHideAddBtn(false)}
            >
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn btn-save">
              Add Task
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FilteredTasks() {
  const { taskManager } = useContext(TaskContext);

  const activeTasks = taskManager.filter((t) => !t.completed);
  const completedTasks = taskManager.filter((t) => t.completed);

  return (
    <div className="filtered-tasks">
      <div className="filtered-section">
        <h2 className="filtered-title">Active Tasks ({activeTasks.length})</h2>
        {!activeTasks.length ? (
          <div className="empty-state">No active tasks</div>
        ) : (
          <ul className="filtered-list">
            {activeTasks.map((t) => {
              return (
                <li key={t.id} className="filtered-item">
                  {t.category}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="filtered-section">
        <h2 className="filtered-title">
          Completed Tasks ({completedTasks.length})
        </h2>
        {!completedTasks.length ? (
          <div className="empty-state">No completed tasks</div>
        ) : (
          <ul className="filtered-list">
            {completedTasks.map((t) => {
              return (
                <li key={t.id} className="filtered-item completed-item">
                  {t.category}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function App() {
  const [taskManager, setTaskManager] = useState(() => {
    const tasks = localStorage.getItem("Tasks");
    return tasks ? JSON.parse(tasks) : [];
  });
  const [hideAddBtn, setHideAddBtn] = useState(false);

  useEffect(() => {
    localStorage.setItem("Tasks", JSON.stringify(taskManager));
  }, [taskManager]);

  const deleteTask = (taskId) => {
    setTaskManager(taskManager.filter((t) => t.id !== taskId));
  };

  return (
    <TaskContext.Provider
      value={{
        taskManager,
        setTaskManager,
        hideAddBtn,
        setHideAddBtn,
        deleteTask,
      }}
    >
      <div className="app">
        <h1 className="main-title">Task Manager</h1>

        <div className="task-list-container">
          <h2 className="section-title">All Tasks ({taskManager.length})</h2>
          <TaskComponent />

          <div className="center-content">
            {!hideAddBtn && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setHideAddBtn(true)}
                >
                  + Add New Task
                </button>
                {taskManager.length ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem("Tasks");
                      setTaskManager([]);
                    }}
                    className="btn btn-secondary"
                  >
                    Clear
                  </button>
                ) : (
                  ""
                )}
              </>
            )}
          </div>

          <AddTask />
        </div>

        <FilteredTasks />
      </div>
    </TaskContext.Provider>
  );
}

export default App;
