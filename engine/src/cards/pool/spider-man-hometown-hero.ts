import { defineCard } from "../define.js";

export default defineCard({
  name: "Spider-Man, Hometown Hero",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 5,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nWhen Spider-Man enters, target creature with power 2 or less can't be blocked this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "When Spider-Man enters, target creature with power 2 or less can't be blocked this turn.",
    },
  ],
});
