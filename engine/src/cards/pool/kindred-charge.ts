import { defineCard } from "../define.js";

// One instruction, so the copies are all planned before any is made
// (`oneTokenEvent`): a Clone's copy, asked as it enters, can't copy another of
// these tokens. "Those tokens gain haste" is an effect on them, not a copy
// exception, so a Clone's copy that replaces its copiable values keeps it.
export default defineCard({
  name: "Kindred Charge",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Choose a creature type. For each creature you control of the chosen type, create a token that's a copy of that creature. Those tokens gain haste. Exile them at the beginning of the next end step.",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "create-token-copy",
      of: { each: { type: "creature", controlledBy: "you", subtype: "$chosen" } },
      count: 1,
      who: "you",
      gains: { keywords: ["haste"] },
      exileAtEndStep: true,
    },
  },
});
