import { defineCard } from "../define.js";

export default defineCard({
  name: "Aliban's Tower",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target blocking creature gets +3/+1 until end of turn.",
  targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
});
