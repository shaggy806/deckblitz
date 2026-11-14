import { defineCard } from "../define.js";

// "From a graveyard": any player's. The card enters under its owner's
// control. A card with {X} in its cost has X = 0 there (the ruling). The
// block restriction is checked only as blockers are declared.
const DAMAGE_TEXT =
  "Whenever Bilbo deals combat damage to a player or battle, put up to one target nonland permanent card with mana value 3 or less from a graveyard onto the battlefield under its owner's control.";

export default defineCard({
  name: "Bilbo, Unexpected Adventurer",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Rogue"],
  power: 2,
  toughness: 2,
  text: `Bilbo can't be blocked by creatures with power 3 or greater.\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "gte", n: 3 } } }],
      text: "Bilbo can't be blocked by creatures with power 3 or greater.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "any",
            filter: {
              typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
              notTypes: ["land"],
              manaValue: { op: "lte", n: 3 },
            },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
