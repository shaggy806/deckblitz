import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 23191.

export default defineCard({
  name: "Festergloom",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Nonblack creatures get -1/-1 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", notColors: ["B"] },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
});
