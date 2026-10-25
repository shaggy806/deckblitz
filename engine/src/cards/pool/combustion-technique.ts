import { defineCard } from "../define.js";

// Rulings:
//   [2025-10-02] Combustion Technique's replacement effect will exile the target creature if it
//     would die this turn for any reason, not just due to lethal damage.

export default defineCard({
  name: "Combustion Technique",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Combustion Technique deals damage equal to 2 plus the number of Lesson cards in your graveyard to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { sum: [2, { countInGraveyard: { subtype: "Lesson", ownedBy: "you" } }] }, target: 0 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
