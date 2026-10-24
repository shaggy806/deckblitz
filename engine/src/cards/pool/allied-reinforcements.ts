import { defineCard } from "../define.js";

export default defineCard({
  name: "Allied Reinforcements",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create two 2/2 white Knight Ally creature tokens.",
  targets: [],
  effect: { kind: "create-token", token: "Knight Ally Token", count: 2 },
});
