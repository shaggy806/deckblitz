import { defineCard } from "../define.js";

const RETURN_TEXT =
  "{2}{B}{G}, Mill four cards: Return this card from your graveyard to the battlefield. Activate only as a sorcery.";

// Rulings: the mill is part of the cost (can't be paid with three or fewer
// cards in the library — rule 701.17b), and it's activated only from the
// graveyard.

export default defineCard({
  name: "Rot Farm Skeleton",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Skeleton"],
  power: 4,
  toughness: 1,
  text: `This creature can't block.\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}{G}", tap: false, mill: 4 },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
