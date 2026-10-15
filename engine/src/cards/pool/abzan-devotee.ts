import { defineCard } from "../define.js";

// EDHREC rank 20056.
const MANA_TEXT = "{1}: Add {W}, {B}, or {G}. Activate only once each turn.";
const RETURN_TEXT = "{2}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Abzan Devotee",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dog", "Cleric"],
  power: 2,
  toughness: 1,
  text: `${MANA_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "B", "G"] }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
      oncePerTurn: true,
    },
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
