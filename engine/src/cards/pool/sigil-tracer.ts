import { defineCard } from "../define.js";

// EDHREC rank 13918. Morningtide.
//
// Rulings:
//   [2008-04-01] If the spell is modal (that is, it says “choose one —” or “choose two —”), the
//     choice of mode(s) can’t be changed.
//   [2008-04-01] Sigil Tracer’s ability can copy an instant or sorcery spell that isn’t targeted.
//   [2008-04-01] Since the activated ability doesn’t have a tap symbol in its cost, you can tap
//     creatures (including Sigil Tracer itself) that haven’t been under your control since your
//     most recent turn began to pay the cost.
//   [2008-04-01] If the controller of the original spell chose to pay an alternative cost (such as
//     prowl) or an additional cost, that choice is also copied.
const TEXT =
  "{1}{U}, Tap two untapped Wizards you control: Copy target instant or sorcery spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Sigil Tracer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{1}{U}",
        tap: false,
        tapOthers: { count: 2, filter: { subtype: "Wizard", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
