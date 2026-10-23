import { defineCard } from "../define.js";

export default defineCard({
  name: "Comparative Analysis",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  alternativeCost: {
    mana: "{2}{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {2}{U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nTarget player draws two cards.",
  targets: ["player"],
  effect: { kind: "draw", amount: 2, target: 0 },
});
