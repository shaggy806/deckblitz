import { defineCard } from "../define.js";

// EDHREC rank 8933.
//
// Rulings:
//   [2023-11-10] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.
//   [2023-11-10] Finality counters aren't keyword counters, and a finality counter doesn't give
//     any abilities to the permanent it's on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.
//   [2023-11-10] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would be put into a graveyard from the battlefield, exile it
//     instead.
//   [2023-11-10] Multiple finality counters on a single permanent are redundant.

// The type is chosen before it moves (rule 614.12 — `chooseCreatureTypeOnEnter`),
// and the end-step target is Battle of Hoover Dam's finality return narrowed
// by `ofChosenType`, read off this enchantment (as it last existed if it has
// left — rule 608.2h). Mandatory: with no such card there, the trigger has no
// target and does nothing.
const CHOOSE_TEXT = "As this enchantment enters, choose a creature type.";
const END_TEXT =
  "At the beginning of your end step, return target creature card of the chosen type from your graveyard to the battlefield with a finality counter on it. (If a creature with a finality counter on it would die, exile it instead.)";

export default defineCard({
  name: "From the Rubble",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `${CHOOSE_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", ofChosenType: true } }],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
