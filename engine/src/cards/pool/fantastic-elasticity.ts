import { defineCard } from "../define.js";

export default defineCard({
  name: "Fantastic Elasticity",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  rebound: true,
  text: "Choose one —\n• Return target nonland permanent to its owner's hand.\n• Return target instant or sorcery card from your graveyard to your hand.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target nonland permanent to its owner's hand.",
        targets: ["nonland-permanent"],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: "Return target instant or sorcery card from your graveyard to your hand.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { typesAnyOf: ["instant", "sorcery"] },
          },
        ],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
    ],
  },
});
