import { useState, useEffect, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task } from './task';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type TaskType = {
  id: string;
  name: string;
};

type ColumnId = 'todo' | 'doing' | 'done';

function loadFromLocalStorage(key: string): TaskType[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }

  const [todo, setTodo] = useState<TaskType[]>(() => loadFromLocalStorage('todo'));
  const [doing, setDoing] = useState<TaskType[]>(() => loadFromLocalStorage('doing'));
  const [done, setDone] = useState<TaskType[]>(() => loadFromLocalStorage('done'));
  const [newTask, setNewTask] = useState('');

  const columns: Record<ColumnId, {
    title: string;
    tasks: TaskType[];
    setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  }> = {
    todo: { title: 'To Do', tasks: todo, setTasks: setTodo },
    doing: { title: 'Doing', tasks: doing, setTasks: setDoing },
    done: { title: 'Done', tasks: done, setTasks: setDone },
  };

  useEffect(() => {
    localStorage.setItem('todo', JSON.stringify(todo));
    localStorage.setItem('doing', JSON.stringify(doing));
    localStorage.setItem('done', JSON.stringify(done));
  }, [todo, doing, done]);

  function handleAddTask(event: FormEvent) {
    event.preventDefault();
    if (newTask.trim() === '') return;

    const newItem = {
      id: uuidv4(),
      name: newTask.trim(),
    };

    setTodo((prev) => [...prev, newItem]);
    setNewTask('');
  }

  function deleteTaskFrom(columnId: ColumnId, taskId: string) {
    const column = columns[columnId];
    column.setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId as ColumnId;
    const destId = destination.droppableId as ColumnId;

    const sourceColumn = columns[sourceId];
    const destColumn = columns[destId];

    const sourceTasks = Array.from(sourceColumn.tasks);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceId === destId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      sourceColumn.setTasks(sourceTasks);
    } else {
      const destTasks = Array.from(destColumn.tasks);
      destTasks.splice(destination.index, 0, movedTask);
      sourceColumn.setTasks(sourceTasks);
      destColumn.setTasks(destTasks);
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 pt-20 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 px-3 py-1 rounded-md transition-all
                  bg-white text-black hover:bg-gray-200 
                  dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
      >
        {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
      </button>

      <h1 className="font-bold text-4xl mb-6">Tarefas</h1>

      <form className="w-full max-w-2xl mb-6 flex" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Digite as tarefas..."
          className="flex-1 h-10 rounded-md px-2 bg-zinc-100 text-black placeholder-zinc-500 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-500 ml-4 rounded-md px-4 text-white font-medium"
        >
          Add
        </button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-row gap-6 w-full max-w-6xl justify-center">
          {Object.entries(columns).map(([columnId, column]) => (
            <section
              key={columnId}
              className="bg-zinc-200 dark:bg-zinc-800 p-4 rounded-md w-full max-w-sm flex flex-col min-h-[300px]"
            >
              <h2 className="text-xl font-semibold mb-4 text-center">
                {column.title}
              </h2>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[100px] flex flex-col gap-2"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Task
                              task={task}
                              onDelete={() => deleteTaskFrom(columnId as ColumnId, task.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
export default App;
