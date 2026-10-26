import { defineCard } from "../define.js";

// EDHREC rank 32268. Colorless is no colours: layer 5 sets them to none.

const TEXT = "{2}: This creature becomes colorless until end of turn.";

export default defineCard({
  name: "Raging Spirit",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "become-color", target: "source", colors: [], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
