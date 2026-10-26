import { defineCard } from "../define.js";

// Rulings:
//   [2018-12-07] Firewing Phoenix's ability can be activated only if Firewing Phoenix is in your
//     graveyard.

const RETURN = "{1}{R}{R}{R}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Firewing Phoenix",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{1}{R}{R}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
});
