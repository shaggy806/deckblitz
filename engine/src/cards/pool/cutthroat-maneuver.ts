import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

export default defineCard({
  name: "Cutthroat Maneuver",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Up to two target creatures each get +1/+1 and gain lifelink until end of turn.",
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
