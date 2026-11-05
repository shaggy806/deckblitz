import { defineCard } from "../define.js";

// EDHREC rank 28741.

export default defineCard({
  name: "Fan Favorite",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  assist: true,
  text: "Assist (Another player can pay up to {3} of this spell's cost.)\n{2}: This creature gets +1/+1 until end of turn. Any player may activate this ability.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gets +1/+1 until end of turn. Any player may activate this ability.",
      anyPlayer: true,
    },
  ],
});
