import { defineCard } from "../define.js";

// EDHREC rank 10319.
// Makes Pest → "Pest Token (Attacks)" (the attack-lifegain Pest; tokens/pest-token-attacks.ts).

export default defineCard({
  name: "Send in the Pest",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: 'Each opponent discards a card. You create a 1/1 black and green Pest creature token with "Whenever this token attacks, you gain 1 life."',
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "each-opponent", amount: 1 },
      { kind: "create-token", token: "Pest Token (Attacks)", count: 1 },
    ],
  },
});
