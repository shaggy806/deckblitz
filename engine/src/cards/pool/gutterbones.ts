import { defineCard } from "../define.js";

export default defineCard({
  name: "Gutterbones",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 2,
  toughness: 1,
  text: "This creature enters tapped.\n{1}{B}: Return this card from your graveyard to your hand. Activate only during your turn and only if an opponent lost life this turn.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
        ],
      },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "{1}{B}: Return this card from your graveyard to your hand. Activate only during your turn and only if an opponent lost life this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
});
