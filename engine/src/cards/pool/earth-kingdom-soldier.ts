import { defineCard } from "../define.js";

// EDHREC rank 19954. Rishkar, Peema Renegade's "each of up to two target
// creatures", of creatures you control.

const ETB_TEXT = "When this creature enters, put a +1/+1 counter on each of up to two target creatures you control.";

export default defineCard({
  name: "Earth Kingdom Soldier",
  manaCost: "{4}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature-you-control" },
        { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
