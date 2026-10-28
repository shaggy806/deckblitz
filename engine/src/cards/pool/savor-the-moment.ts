import { defineCard } from "../define.js";

export default defineCard({
  name: "Savor the Moment",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Take an extra turn after this one. Skip the untap step of that turn.",
  targets: [],
  effect: { kind: "take-extra-turn", skipUntapStep: true },
});
