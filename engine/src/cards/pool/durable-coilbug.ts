import { defineCard } from "../define.js";

// EDHREC rank 23337. Ikoria: Lair of Behemoths.

const RETURN_TEXT = "{4}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Durable Coilbug",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  text: RETURN_TEXT,
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
