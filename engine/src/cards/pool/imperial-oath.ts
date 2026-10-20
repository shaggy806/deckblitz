import { defineCard } from "../define.js";

// EDHREC rank 17649.
// Makes Samurai → use "Samurai Token".

export default defineCard({
  name: "Imperial Oath",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create three 2/2 white Samurai creature tokens with vigilance. Scry 3.",
  effect: {
    kind: "sequence",
    effects: [{ kind: "create-token", token: "Samurai Token", count: 3 }, { kind: "scry", amount: 3 }],
  },
});
