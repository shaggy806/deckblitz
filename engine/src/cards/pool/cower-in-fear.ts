import { defineCard } from "../define.js";

export default defineCard({
  name: "Cower in Fear",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Creatures your opponents control get -1/-1 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
});
