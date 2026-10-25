import { defineCard } from "../define.js";

export default defineCard({
  name: "Jwar Isle Avenger",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  alternativeCost: {
    mana: "{2}{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {2}{U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nFlying",
});
