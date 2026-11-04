import { defineCard } from "../define.js";

// EDHREC rank 2484.

export default defineCard({
  name: "Endless Atlas",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Draw a card. Activate only if you control three or more lands with the same name.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, {T}: Draw a card. Activate only if you control three or more lands with the same name.",
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 3, sharingAName: true },
    },
  ],
});
