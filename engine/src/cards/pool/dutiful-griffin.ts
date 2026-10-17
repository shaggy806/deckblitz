import { defineCard } from "../define.js";

// EDHREC rank 27608. Wilds of Eldraine. Eldrazi Ravager's graveyard return:
// the card isn't part of the cost (`staysInZone`), and the two enchantments
// are chosen as the cost is paid.
const RETURN_TEXT = "{2}{W}, Sacrifice two enchantments: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Dutiful Griffin",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, sacrifice: { filter: { type: "enchantment" }, count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
