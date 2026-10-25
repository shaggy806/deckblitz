import { defineCard } from "../define.js";

// EDHREC rank 7420. Each mode has its own target, so with both chosen one
// artifact creature may be targeted twice (the ruling). The tokens are the
// caster's whoever controls what they copy.

export default defineCard({
  name: "Saheeli's Artistry",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Create a token that's a copy of target artifact.\n• Create a token that's a copy of target creature, except it's an artifact in addition to its other types.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Create a token that's a copy of target artifact.",
        targets: ["artifact"],
        effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      },
      {
        text: "Create a token that's a copy of target creature, except it's an artifact in addition to its other types.",
        targets: ["creature"],
        effect: { kind: "create-token-copy", of: 0, count: 1, who: "you", exceptions: { addTypes: ["artifact"] } },
      },
    ],
  },
});
