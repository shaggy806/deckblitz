import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

export default defineCard({
  name: "Mischief and Mayhem",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Up to two target creatures each get +4/+4 until end of turn.",
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 4, toughness: 4, duration: "end-of-turn" },
    ],
  },
});
