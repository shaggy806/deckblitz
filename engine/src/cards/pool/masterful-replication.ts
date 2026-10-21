import { defineCard } from "../define.js";

// EDHREC rank 8936. The copy mode is Nanogene Conversion's `become-copy` over
// "each other" artifact you control: copiable values only (rule 707.2), and a
// target that is itself a copy hands on what it copies (the rulings).

const GOLEMS = "Create two 3/3 colorless Golem artifact creature tokens.";
const COPY =
  "Choose target artifact you control. Each other artifact you control becomes a copy of that artifact until end of turn.";

export default defineCard({
  name: "Masterful Replication",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${GOLEMS}\n• ${COPY}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: GOLEMS, targets: [], effect: { kind: "create-token", token: "Golem Token", count: 2 } },
      {
        text: COPY,
        targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
        effect: {
          kind: "become-copy",
          filter: { type: "artifact", controlledBy: "you" },
          exceptOf: true,
          of: 0,
          until: "end-of-turn",
        },
      },
    ],
  },
});
