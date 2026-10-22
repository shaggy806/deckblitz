import { defineCard } from "../define.js";

// EDHREC rank 24053. Two distinct targets (the ruling: not the same Merfolk
// twice), and it can target itself.

const TEXT = "When this creature enters, put a +1/+1 counter on each of up to two target Merfolk you control.";
const YOUR_MERFOLK = { kind: "permanent", whose: "you", filter: { subtype: "Merfolk" } } as const;

export default defineCard({
  name: "Vineshaper Mystic",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: YOUR_MERFOLK },
        { kind: "optional", of: { kind: "other", of: YOUR_MERFOLK, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
