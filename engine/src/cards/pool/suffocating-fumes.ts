import { defineCard } from "../define.js";

export default defineCard({
  name: "Suffocating Fumes",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Creatures your opponents control get -1/-1 until end of turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
});
