export function parseTasksFromText(text) {
  if (!text) return [];
  return text
    .split('\n')
    .filter(line => line.startsWith('* ['))
    .map((line, index) => {
      const completed = line.startsWith('* [x]');
      const taskText = line.replace('* [ ] ', '').replace('* [x] ', '');
      return { id: String(index), text: taskText, completed };
    });
}

export function serializeTasksToText(tasks) {
  return tasks
    .map(t => `* [${t.completed ? 'x' : ' '}] ${t.text}`)
    .join('\n');
}