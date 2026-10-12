import { defineCard } from "../define.js";

// EDHREC rank 9231.
//
// Rulings:
//   [2026-01-27] Splinter's first ability doesn't copy the triggered ability; it just causes the
//     ability to trigger an additional time. Any choices made as you put the ability onto the
//     stack, such as modes and targets, are made separately for each instance of the ability. Any
//     choices made on resolution, such as whether to put counters on a permanent, are also made
//     individually.
//   [2026-01-27] If a triggered ability is linked to a second ability, additional instances of
//     that triggered ability are also linked to that second ability. If the second ability refers
//     to "the exiled card," it refers to all cards exiled by instances of the triggered ability.

const DOUBLE_TEXT =
  "If a triggered ability of a Ninja creature you control triggers, that ability triggers an additional time.";
const UNBLOCKABLE_TEXT = "{1}{U}: Target Ninja can't be blocked this turn.";

// "Target Ninja" is any Ninja permanent (Daughter of the Deep's "Target
// Merfolk", Turtle Lair's "Target Ninja or Turtle").
export default defineCard({
  name: "Splinter, Radical Rat",
  manaCost: "{1}{W/B}{W/B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Rat"],
  power: 2,
  toughness: 4,
  text: `${DOUBLE_TEXT}\n${UNBLOCKABLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      doubleTriggersOf: { filter: { type: "creature", subtype: "Ninja", controlledBy: "you" } },
      text: DOUBLE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Ninja" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
