import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 6811. The exchange is all or nothing (rule
// 701.12a): nothing if either target is illegal, or one player controls both.
// The spell's controller — its new one if it changed hands — may choose new
// targets for it either way, while it's still on the stack.
export default defineCard({
  name: "Sudden Substitution",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nExchange control of target noncreature spell and target creature. Then the spell's controller may choose new targets for it.",
  splitSecond: true,
  targets: ["noncreature-spell", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exchange-control", objects: [0, 1] },
      { kind: "change-targets", target: 0, how: "choose-new", by: "its-controller" },
    ],
  },
});
