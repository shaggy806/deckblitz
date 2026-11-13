import { defineCard } from "../define.js";

// EDHREC rank 3210.
// Rulings:
//   [2019-01-25] For spells with {X} in their mana costs, use the value chosen for X to determine
//     the spell's mana value.
//   [2019-01-25] Effects that modify or replace the cost to cast a spell (such as flashback or
//     casting a spell without paying its mana cost due to suspend) don't affect the spell's mana
//     value, so they won't change whether Lavinia's first ability restricts that spell from being
//     cast.
//
// "The number of lands that player controls" is the caster's own count: the
// filter's amount read for the spell's controller (`forItsController`), its
// "each" that player.

const LANDS_TEXT = "Each opponent can't cast noncreature spells with mana value greater than the number of lands that player controls.";
const FREE_TEXT = "Whenever an opponent casts a spell, if no mana was spent to cast it, counter that spell.";

export default defineCard({
  name: "Lavinia, Azorius Renegade",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${LANDS_TEXT}\n${FREE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        {
          act: "cast",
          who: "opponents",
          filter: {
            notTypes: ["creature"],
            manaValue: {
              op: "gt",
              n: { amount: { countOf: { type: "land", controlledBy: "you" }, forEachPlayer: true }, forItsController: true },
            },
          },
        },
      ],
      text: LANDS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { manaSpent: [{ amount: { op: "eq", n: 0 } }] } },
      targets: [],
      effect: { kind: "counter", target: "trigger-object" },
      resolve: null,
      text: FREE_TEXT,
    },
  ],
});
