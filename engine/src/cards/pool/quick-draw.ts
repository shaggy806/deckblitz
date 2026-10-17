import { defineCard } from "../define.js";

// Two targets: a creature you control and an opponent. The loss reaches the
// creatures that opponent controls as it resolves (rule 611.2c).

export default defineCard({
  name: "Quick Draw",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control gets +1/+1 and gains first strike until end of turn. Creatures target opponent controls lose first strike and double strike until end of turn.",
  targets: ["creature-you-control", "opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      {
        kind: "lose-keywords",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 1,
        keywords: ["first-strike", "double-strike"],
        duration: "end-of-turn",
      },
    ],
  },
});
