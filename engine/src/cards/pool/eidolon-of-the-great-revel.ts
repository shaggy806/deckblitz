import { defineCard } from "../define.js";

const TEXT =
  "Whenever a player casts a spell with mana value 3 or less, this creature deals 2 damage to that player.";

export default defineCard({
  name: "Eidolon of the Great Revel",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { manaValue: { op: "lte", n: 3 } } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
