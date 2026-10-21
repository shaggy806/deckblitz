import { defineCard } from "../define.js";

// Swords to Plowshares' shape, the life yours: the power is read as the
// creature last existed on the battlefield (the first ruling).
export default defineCard({
  name: "Infernal Reckoning",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target colorless creature. You gain life equal to its power.",
  targets: [{ kind: "permanent", filter: { type: "creature", colorless: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "gain-life", amount: { powerOf: 0 } },
    ],
  },
});
