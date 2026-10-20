import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 20568.
//
// Metalwork Colossus's graveyard return, paid with two Treasures.
const RETURN_TEXT = "Sacrifice two Treasures: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Gilded Assault Cart",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${crewText(2)}\n${RETURN_TEXT}`,
  activated: [
    crew(2),
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" }, count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
