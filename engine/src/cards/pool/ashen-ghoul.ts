import { defineCard } from "../define.js";

// EDHREC rank 25608.
export default defineCard({
  name: "Ashen Ghoul",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\n{B}: Return this card from your graveyard to the battlefield. Activate only during your upkeep and only if three or more creature cards are above this card.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          { kind: "turn-structure", steps: ["upkeep"] },
          { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature", aboveSourceInGraveyard: true } },
        ],
      },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: "{B}: Return this card from your graveyard to the battlefield. Activate only during your upkeep and only if three or more creature cards are above this card.",
    },
  ],
});
