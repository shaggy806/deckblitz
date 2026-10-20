import { defineCard } from "../define.js";

// EDHREC rank 9077.

export default defineCard({
  name: "Alchemist's Retrieval",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cleave {1}{U} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nReturn target nonland permanent [you control] to its owner's hand.",
  // Cleave (rule 702.148): the bracketless text, "Return target nonland
  // permanent to its owner's hand", cast for {1}{U}.
  targets: [{ kind: "permanent", whose: "you", filter: { notTypes: ["land"] } }],
  effect: { kind: "return-to-hand", target: 0 },
  cleave: {
    cost: "{1}{U}",
    targets: ["nonland-permanent"],
    effect: { kind: "return-to-hand", target: 0 },
  },
});
