import { noTodoDocMarker } from "./no-todo-doc-marker.mjs";

/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
  rules: {
    "no-todo-doc-marker": noTodoDocMarker,
  },
};

export default plugin;
