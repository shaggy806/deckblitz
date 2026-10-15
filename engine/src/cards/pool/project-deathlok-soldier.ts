import { defineCard } from "../define.js";

const RETURN_TEXT = "{2}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Project Deathlok Soldier",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 1,
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
