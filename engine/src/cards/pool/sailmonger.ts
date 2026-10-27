import { defineCard } from "../define.js";

// EDHREC rank 28197.

export default defineCard({
  name: "Sailmonger",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monger"],
  power: 3,
  toughness: 3,
  text: "{2}: Target creature gains flying until end of turn. Any player may activate this ability.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target creature gains flying until end of turn. Any player may activate this ability.",
      anyPlayer: true,
    },
  ],
});
