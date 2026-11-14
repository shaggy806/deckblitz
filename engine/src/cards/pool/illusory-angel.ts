import { defineCard } from "../define.js";

// "Another spell": one cast before this one this turn, resolved or not (the
// rulings) — asked before this one is cast, so it isn't among them.
export default defineCard({
  name: "Illusory Angel",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Angel", "Illusion"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Cast this spell only if you've cast another spell this turn.\nFlying",
  castOnlyIf: { kind: "cast-this-turn", who: "you", atLeast: 1 },
});
