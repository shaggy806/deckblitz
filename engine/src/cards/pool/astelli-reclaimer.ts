import { defineCard } from "../define.js";

// EDHREC rank 8597.
//
// Rulings:
//   [2025-07-25] If a copy of Astelli Reclaimer is created on the stack, no mana was spent to cast
//     the copy, so X will be 0. The amount of mana spent to cast the original spell is not copied.
//   [2025-07-25] Astelli Reclaimer's enters ability cares about the mana you actually paid to cast
//     Astelli Reclaimer, not its mana cost. If you cast Astelli Reclaimer for {3}{W}{W}, X is 5.
//     If you cast it with warp for {2}{W}, X is 3. Any effects that increase or decrease the cost
//     to cast it will also be taken into account.
//   [2025-07-25] If an effect requires you to pay some amount of mana to prevent Astelli Reclaimer
//     from being countered, as Divert Disaster does, that mana wasn't spent to cast Astelli
//     Reclaimer and will not be taken into account.
//   [2025-07-25] If an effect allows you to cast Astelli Reclaimer without paying its mana cost, X
//     will be 0.
//   [2025-07-25] If a card in your graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// X is the mana the permanent kept from its cast (`manaSpentOf`, 0 when it
// wasn't cast), read in the target filter (Mockingbird's operand) — so a
// target is checked against it as it's chosen and again on resolution.

const ETB_TEXT =
  "When this creature enters, return target noncreature, nonland permanent card with mana value X or less from your graveyard to the battlefield, where X is the amount of mana spent to cast this creature.";

export default defineCard({
  name: "Astelli Reclaimer",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\nWarp {2}{W}`,
  warp: { cost: "{2}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "enchantment", "planeswalker", "battle"],
            notTypes: ["creature", "land"],
            manaValue: { op: "lte", n: { amount: { manaSpentOf: "source" } } },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
