import { defineCard } from "../define.js";

// EDHREC rank 30297. No {T} in the cost, so it can tap several Walls a turn,
// tapped or summoning sick (its rulings).

export default defineCard({
  name: "Ali Baba",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: "{R}: Tap target Wall.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{R}: Tap target Wall.",
    },
  ],
});
