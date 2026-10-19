import { defineCard } from "../define.js";

export default defineCard({
  name: "Arms of Hadar",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Creatures target player controls get -2/-2 until end of turn.",
  targets: ["player"],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    power: -2,
    toughness: -2,
    duration: "end-of-turn",
  },
});
