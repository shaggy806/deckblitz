import { defineCard } from "../define.js";

export default defineCard({
  name: "Turn the Tide",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Creatures your opponents control get -2/-0 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: -2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
