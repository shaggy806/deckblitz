import { defineCard } from "../define.js";

// EDHREC rank 9743.
//
// Rulings:
//   [2024-11-08] The instant or sorcery card you return doesn't have to be one of the milled
//     cards. It can't be Inspiration from Beyond itself, which will be on the stack and not in
//     your graveyard as it's resolving.

export default defineCard({
  name: "Inspiration from Beyond",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{5}{U}{U}" },
  text: "Mill three cards, then return an instant or sorcery card from your graveyard to your hand.\nFlashback {5}{U}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 3 },
      {
        kind: "return-from-graveyard",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "hand",
        count: 1,
      },
    ],
  },
});
