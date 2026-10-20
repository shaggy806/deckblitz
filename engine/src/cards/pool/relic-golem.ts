import { defineCard } from "../define.js";

// Bast, Panther Goddess's shape: both restrictions while the condition fails.

const RESTRICT_TEXT = "This creature can't attack or block unless an opponent has eight or more cards in their graveyard.";
const MILL_TEXT = "{2}, {T}: Target player mills two cards.";

export default defineCard({
  name: "Relic Golem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 6,
  toughness: 6,
  text: `${RESTRICT_TEXT}\n${MILL_TEXT} (They put the top two cards of their library into their graveyard.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 } },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
