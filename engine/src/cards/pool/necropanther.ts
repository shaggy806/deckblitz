import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, return target creature card with mana value 3 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Necropanther",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Cat", "Nightmare"],
  power: 3,
  toughness: 3,
  mutate: "{2}{W/B}{W/B}",
  text: `Mutate {2}{W/B}{W/B} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
