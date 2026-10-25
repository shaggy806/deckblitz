import { defineCard } from "../define.js";

const TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, destroy target enchantment creature an opponent controls.";

export default defineCard({
  name: "Leonin Iconoclast",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Monk"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [{ kind: "permanent", whose: "opponent", filter: { types: ["enchantment", "creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
