import { defineCard } from "../define.js";

export default defineCard({
  name: "Overwhelming Denial",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  cantBeCountered: true,
  alternativeCost: {
    mana: "{U}{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {U}{U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nThis spell can't be countered.\nCounter target spell.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
