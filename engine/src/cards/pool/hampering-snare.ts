import { defineCard } from "../define.js";

export default defineCard({
  name: "Hampering Snare",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Creatures your opponents control get -2/-0 until end of turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: -2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
