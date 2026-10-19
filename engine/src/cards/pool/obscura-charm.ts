import { defineCard } from "../define.js";

export default defineCard({
  name: "Obscura Charm",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Return target multicolored permanent card with mana value 3 or less from your graveyard to the battlefield tapped.\n" +
    "• Counter target instant or sorcery spell.\n" +
    "• Destroy target creature or planeswalker with mana value 3 or less.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target multicolored permanent card with mana value 3 or less from your graveyard to the battlefield tapped.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { multicolored: true, notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
          },
        ],
        effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      },
      {
        text: "Counter target instant or sorcery spell.",
        targets: ["instant-or-sorcery-spell"],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Destroy target creature or planeswalker with mana value 3 or less.",
        targets: [
          {
            kind: "permanent",
            filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: 3 } },
          },
        ],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
