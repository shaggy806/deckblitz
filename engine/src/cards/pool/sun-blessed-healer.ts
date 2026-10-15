import { defineCard } from "../define.js";

const KICKED_TEXT =
  "When this creature enters, if it was kicked, return target nonland permanent card with mana value 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Sun-Blessed Healer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Kicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\nLifelink (Damage dealt by this creature also causes you to gain that much life.)\n${KICKED_TEXT}`,
  kicker: { cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
            notTypes: ["land"],
            manaValue: { op: "lte", n: 2 },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: KICKED_TEXT,
    },
  ],
});
