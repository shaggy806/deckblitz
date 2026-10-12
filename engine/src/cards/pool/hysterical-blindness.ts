import { defineCard } from "../define.js";

export default defineCard({
  name: "Hysterical Blindness",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Creatures your opponents control get -4/-0 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: -4,
    toughness: 0,
    duration: "end-of-turn",
  },
});
