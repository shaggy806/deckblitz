import { defineCard } from "../define.js";

// EDHREC rank 30427.

export default defineCard({
  name: "Flailing Ogre",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 3,
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
