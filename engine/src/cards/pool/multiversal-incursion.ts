import { defineCard } from "../define.js";

// EDHREC rank 10444. Second Harvest's `{ each }`, with Impostor Syndrome's
// "except it isn't legendary": the creatures are fixed as it resolves.
export default defineCard({
  name: "Multiversal Incursion",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each nontoken creature you control, create a token that's a copy of that creature, except it isn't legendary.",
  targets: [],
  effect: {
    kind: "create-token-copy",
    of: { each: { type: "creature", token: false, controlledBy: "you" } },
    count: 1,
    notLegendary: true,
  },
});
