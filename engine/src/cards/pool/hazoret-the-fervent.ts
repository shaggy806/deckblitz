import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 15482.
//
// Rulings:
//   Once Hazoret has attacked or blocked, it will remain in combat even if the
//   number of cards in your hand becomes two or greater.

const RESTRICTION = "Hazoret can't attack or block unless you have one or fewer cards in hand.";
const PING = "{2}{R}, Discard a card: Hazoret deals 2 damage to each opponent.";

export default defineCard({
  name: "Hazoret the Fervent",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 4,
  keywords: ["indestructible", "haste"],
  text: `Indestructible, haste\n${RESTRICTION}\n${PING}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "hand-size", atMost: 1 } },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICTION,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: PING,
    },
  ],
});
