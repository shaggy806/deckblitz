import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Excava attacks, return up to one target artifact, creature, or non-Aura enchantment card with mana value 3 or less from your graveyard to the battlefield with a finality counter on it. It's a 1/1 Spirit creature with flying in addition to its other types.";

// "It's a 1/1 Spirit creature with flying in addition to its other types" is
// part of the return (`enterAs`), in place as it enters: an artifact or
// enchantment arrives as a creature ("whenever a creature enters" sees it),
// base 1/1 (layer 7b) with flying, for as long as it's on the battlefield.
// The finality counter needs nothing more (`moveObject` reads it).
export default defineCard({
  name: "Excava, the Risen Past",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Horse"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ATTACK_TEXT} (If a creature with a finality counter on it would die, exile it instead.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: {
              anyOf: [{ type: "artifact" }, { type: "creature" }, { type: "enchantment", notSubtypes: ["Aura"] }],
              manaValue: { op: "lte", n: 3 },
            },
          },
        },
      ],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        withCounters: { kind: "finality", amount: 1 },
        enterAs: { addTypes: ["creature"], addSubtypes: ["Spirit"], basePt: [1, 1], keywords: ["flying"] },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
