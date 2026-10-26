import { defineCard } from "../define.js";

export default defineCard({
  name: "Feral Lightning",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create three 3/1 red Elemental creature tokens with haste. Exile them at the beginning of the next end step.",
  targets: [],
  effect: { kind: "create-token", token: "3/1 Red Elemental Token (Haste)", count: 3, exileAtEndStep: true },
});
