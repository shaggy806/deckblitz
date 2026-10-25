import { defineCard } from "../define.js";

export default defineCard({
  name: "Neutralizing Blast",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target multicolored spell.",
  targets: [{ kind: "spell", filter: { multicolored: true } }],
  effect: { kind: "counter", target: 0 },
});
