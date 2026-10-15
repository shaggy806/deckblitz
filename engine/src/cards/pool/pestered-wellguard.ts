import { defineCard } from "../define.js";

// EDHREC rank 16707.
// Makes Faerie → "Blue-Black Faerie Token".
const TEXT = "Whenever this creature becomes tapped, create a 1/1 blue and black Faerie creature token with flying.";

export default defineCard({
  name: "Pestered Wellguard",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blue-Black Faerie Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
