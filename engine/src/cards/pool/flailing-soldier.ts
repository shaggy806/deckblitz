import { defineCard } from "../define.js";

// EDHREC rank 26627.

export default defineCard({
  name: "Flailing Soldier",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "{1}: This creature gets +1/+1 until end of turn. Any player may activate this ability.\n{1}: This creature gets -1/-1 until end of turn. Any player may activate this ability.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gets +1/+1 until end of turn. Any player may activate this ability.",
      anyPlayer: true,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}: This creature gets -1/-1 until end of turn. Any player may activate this ability.",
      anyPlayer: true,
    },
  ],
});
