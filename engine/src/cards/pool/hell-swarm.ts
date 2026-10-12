import { defineCard } from "../define.js";

export default defineCard({
  name: "Hell Swarm",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "All creatures get -1/-0 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: -1,
    toughness: 0,
    duration: "end-of-turn",
  },
});
