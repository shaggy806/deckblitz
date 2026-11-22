import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 20175.
//
// Spell mastery is checked as this resolves, after the counter (so a spell of
// yours countered into your graveyard counts). The copy is of the spell as it
// last was on the stack (rule 608.2h) — targets, modes and X with it (707.10) —
// and is yours. One that can't be countered wasn't countered this way, so
// there's nothing to copy.
export default defineCard({
  name: "Psychic Rebuttal",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Counter target instant or sorcery spell that targets you.\n" +
    "Spell mastery — If there are two or more instant and/or sorcery cards in your graveyard, you may copy the spell countered this way. You may choose new targets for the copy.",
  targets: [
    {
      kind: "spell",
      filter: { typesAnyOf: ["instant", "sorcery"], targets: { player: "you" } },
    },
  ],
  effect: {
    kind: "counter",
    target: 0,
    ifCountered: {
      kind: "conditional",
      condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
      then: {
        kind: "may",
        prompt: "Copy the spell countered this way, and choose new targets for the copy?",
        effect: { kind: "copy-spell", target: 0, newTargets: true, asLastOnStack: true },
      },
    },
  },
});
