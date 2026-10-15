import { defineCard } from "../define.js";

// EDHREC rank 19413. Project Deathlok Soldier's ability.

const RETURN_TEXT = "{2}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Merchant of Many Hats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Peasant", "Ally"],
  power: 2,
  toughness: 2,
  text: RETURN_TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
