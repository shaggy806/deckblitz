import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 32108.

const X = { sum: [1, { countInGraveyard: { name: "Kjeldoran War Cry" } }] } as const;

export default defineCard({
  name: "Kjeldoran War Cry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +X/+X until end of turn, where X is 1 plus the number of cards named Kjeldoran War Cry in all graveyards.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: X,
    toughness: X,
    duration: "end-of-turn",
  },
});
