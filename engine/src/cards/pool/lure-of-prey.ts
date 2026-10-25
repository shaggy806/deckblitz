import { defineCard } from "../define.js";

export default defineCard({
  name: "Lure of Prey",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only if an opponent cast a creature spell this turn.\nYou may put a green creature card from your hand onto the battlefield.",
  castOnlyIf: { kind: "cast-this-turn", who: "opponent", filter: { type: "creature" } },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "hand",
    min: 0,
    max: 1,
    destination: "battlefield",
    leftover: "stay",
    filter: { type: "creature", colors: ["G"] },
  },
});
