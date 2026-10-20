import { defineCard } from "../define.js";

// EDHREC rank 12650.

const ROLL_TEXT = "Whenever you roll one or more dice, create a 1/1 blue Faerie Dragon creature token with flying.";

export default defineCard({
  name: "Feywild Trickster",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Gnome", "Warlock"],
  power: 2,
  toughness: 2,
  text: ROLL_TEXT,
  triggered: [
    {
      trigger: { on: "rolls-dice", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Faerie Dragon Token", count: 1 },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});
