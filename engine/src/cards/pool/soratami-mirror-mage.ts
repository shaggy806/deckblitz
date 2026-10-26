import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 17426. Pearl Lake Ancient's cost.
const BOUNCE = "{3}, Return three lands you control to their owner's hand: Return target creature to its owner's hand.";

export default defineCard({
  name: "Soratami Mirror-Mage",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${BOUNCE}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false, returnToHand: { count: 3, filter: { type: "land" } } },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
