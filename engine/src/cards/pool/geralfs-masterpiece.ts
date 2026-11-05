import { defineCard } from "../define.js";

const PT = "This creature gets -1/-1 for each card in your hand.";
const RETURN = "{3}{U}, Discard three cards: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Geralf's Masterpiece",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${PT}\n${RETURN}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, pt: [-1, -1] },
      text: PT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false, discard: { count: 3 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN,
    },
  ],
});
