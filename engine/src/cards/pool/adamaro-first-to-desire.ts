import { defineCard } from "../define.js";

const TEXT = "Adamaro's power and toughness are each equal to the number of cards in the hand of the opponent with the most cards in hand.";

// A characteristic-defining ability (rule 604.3), so it's on in every zone.
export default defineCard({
  name: "Adamaro, First to Desire",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-largest-opponent-hand", plusPower: 0, plusToughness: 0 },
      text: TEXT,
    },
  ],
});
