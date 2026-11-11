import { defineCard } from "../define.js";

// EDHREC rank 5853.
//
// Rulings:
//   [2023-02-04] A copy is created even if the spell that caused the delayed triggered ability to
//     trigger has been countered by the time that delayed triggered ability resolves.
//
// "You may remove two oil counters from it. If you do, …": offered only while
// it's still on the battlefield with two to remove — one that has left has
// none, whatever it last had — and the delayed ability is set up only when
// they were removed.
const OIL_TEXT = "Whenever you cast a noncreature spell, put an oil counter on this creature.";
const COPY_TEXT =
  "Whenever this creature deals combat damage to a player, you may remove two oil counters from it. If you do, when you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Mercurial Spelldancer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Rogue"],
  power: 2,
  toughness: 1,
  text: `This creature can't be blocked.\n${OIL_TEXT}\n${COPY_TEXT}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: "This creature can't be blocked." }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: OIL_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 2 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove two oil counters to copy the next instant or sorcery spell you cast this turn?",
          effect: { kind: "remove-counter", target: "source", counter: "oil", amount: 2 },
          then: {
            kind: "delayed-trigger",
            at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
            effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
            text: "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.",
          },
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
