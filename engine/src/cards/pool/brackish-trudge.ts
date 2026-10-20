import { defineCard } from "../define.js";

export default defineCard({
  name: "Brackish Trudge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus", "Beast"],
  power: 4,
  toughness: 2,
  text: "This creature enters tapped.\n{1}{B}: Return this card from your graveyard to your hand. Activate only if you gained life this turn.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "{1}{B}: Return this card from your graveyard to your hand. Activate only if you gained life this turn.",
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
