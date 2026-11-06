import { defineCard } from "../define.js";

// EDHREC rank 25667.

export default defineCard({
  name: "Resistance Is Futile",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target nonartifact creature.\n• Return target artifact creature card with mana value 3 or less from your graveyard to the battlefield.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target nonartifact creature.",
        targets: ["nonartifact-creature"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Return target artifact creature card with mana value 3 or less from your graveyard to the battlefield.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { types: ["artifact", "creature"], manaValue: { op: "lte", n: 3 } },
          },
        ],
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
    ],
  },
});
