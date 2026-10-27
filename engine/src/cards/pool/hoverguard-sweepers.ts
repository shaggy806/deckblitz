import { defineCard } from "../define.js";

// EDHREC rank 23900.

export default defineCard({
  name: "Hoverguard Sweepers",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drone"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you may return up to two target creatures to their owners' hands.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target creatures to their owners' hands?",
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0 },
            { kind: "return-to-hand", target: 1 },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, you may return up to two target creatures to their owners' hands.",
    },
  ],
});
