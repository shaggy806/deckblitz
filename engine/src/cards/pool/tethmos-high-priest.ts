import { defineCard } from "../define.js";

const TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, return target creature card with mana value 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Tethmos High Priest",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
