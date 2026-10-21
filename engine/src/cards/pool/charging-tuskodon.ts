import { defineCard } from "../define.js";

// Combat damage to a player is only ever dealt to the defending player, an
// opponent of its controller. Rulings: trample assigns by its actual power and
// the damage is doubled only as it's dealt; the doubled damage is still combat
// damage.
const DOUBLE =
  "If this creature would deal combat damage to a player, it deals double that damage to that player instead.";

export default defineCard({
  name: "Charging Tuskodon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${DOUBLE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", multiplier: 2, fromSelf: true, combat: true, to: "opponent" },
      text: DOUBLE,
    },
  ],
});
