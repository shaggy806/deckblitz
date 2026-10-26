import { defineCard } from "../define.js";

// EDHREC rank 24649. Return to Ravnica.
//
// Rulings:
//   Populate doesn't target; you may copy the token you just created, or another creature token
//     you control.
//   If you control no creature tokens when you populate, nothing will happen.

export default defineCard({
  name: "Horncaller's Chant",
  manaCost: "{7}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 4/4 green Rhino creature token with trample, then populate. (Create a token that's a copy of a creature token you control.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [{ kind: "create-token", token: "Rhino Token", count: 1 }, { kind: "populate" }],
  },
});
