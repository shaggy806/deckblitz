import { defineCard } from "../define.js";

// Kicked, the player discards three cards instead of two — not five (the ruling).
export default defineCard({
  name: "Bog Down",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker—Sacrifice two lands. (You may sacrifice two lands in addition to any other costs as you cast this spell.)\nTarget player discards two cards. If this spell was kicked, that player discards three cards instead.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 2 },
  kicker: {
    cost: "",
    also: { text: "Sacrifice two lands", sacrifice: { filter: { type: "land" }, count: 2 } },
    targets: ["player"],
    effect: { kind: "discard", target: 0, amount: 3 },
  },
});
