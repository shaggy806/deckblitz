import { defineCard } from "../define.js";

// EDHREC rank 21547. Recoil's sequence on an enters trigger.
const TEXT = "When this creature enters, return target permanent to its owner's hand, then that player discards a card.";

export default defineCard({
  name: "Dinrova Horror",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "discard", target: { ownerOfTarget: 0 }, amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
