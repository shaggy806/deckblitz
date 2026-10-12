import { defineCard } from "../define.js";

export default defineCard({
  name: "Enlightened Maniac",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 2,
  text: "When this creature enters, create a 3/2 colorless Eldrazi Horror creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Horror Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 3/2 colorless Eldrazi Horror creature token.",
    },
  ],
});
