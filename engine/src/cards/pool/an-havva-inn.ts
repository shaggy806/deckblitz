import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 26286. Every green creature counts, whoever
// controls it.

export default defineCard({
  name: "An-Havva Inn",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You gain X plus 1 life, where X is the number of green creatures on the battlefield.",
  targets: [],
  effect: { kind: "gain-life", amount: { sum: [{ countOf: { type: "creature", colors: ["G"] } }, 1] } },
});
