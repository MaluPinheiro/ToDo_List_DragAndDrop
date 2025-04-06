interface TaskProps {
  task: {
    id: string;
    name: string;
  };
  onDelete: () => void;
}

export function Task({ task, onDelete }: TaskProps) {
  return (
    <div className="w-full bg-zinc-300 mb-2 last:mb-0 px-2 py-3 rounded-xl border-[2px] border-zinc-800 flex justify-between items-center">
      <p className="font-medium">{task.name}</p>
      <button
        onClick={onDelete}
        className="ml-4"
        title="Deletar tarefa"
      >
        <img
          src="/icon_bin.png"
          alt="Delete"
          className="w-5 h-5 hover:scale-110 transition-transform"
        />
      </button>
    </div>
  );
}
