import { defineCard } from "../define.js";

// EDHREC rank 12582. Rule 701.12b: all or nothing — if either land is an
// illegal target as it resolves, no exchange (the ruling).

const TEXT = "When this creature enters, exchange control of target land you control and target land an opponent controls.";

export default defineCard({
  name: "Vedalken Plotter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control", { kind: "permanent", whose: "opponent", filter: { type: "land" } }],
      effect: { kind: "exchange-control", objects: [0, 1] },
      resolve: null,
      text: TEXT,
    },
  ],
});
