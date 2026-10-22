import { defineCard } from "../define.js";

// EDHREC rank 24914. Amonkhet. The creatures attacking as it resolves.

export default defineCard({
  name: "Pursue Glory",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Attacking creatures get +2/+0 until end of turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", attacking: true },
    power: 2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
