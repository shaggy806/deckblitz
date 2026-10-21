import { defineCard } from "../define.js";

// EDHREC rank 29463. Genasi Enforcers' shape.

const TEXT = "{1}{R}: Each creature you control named Pack Mastiff gets +1/+0 until end of turn.";

export default defineCard({
  name: "Pack Mastiff",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", name: "Pack Mastiff" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
