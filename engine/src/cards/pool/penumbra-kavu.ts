import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 29122.

const DIES_TEXT = "When this creature dies, create a 3/3 black Kavu creature token.";

export default defineCard({
  name: "Penumbra Kavu",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 3,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kavu Token (Black, 3/3)", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
