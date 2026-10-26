import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 17307.
//
// Rulings:
//   [2006-07-15] You can't exile a card from your hand to pay for itself. At the time you would
//     pay costs, that card is on the stack, not in your hand.
//   [2006-07-15] If you don't have two cards of the right color in your hand, you can't choose to
//     cast the spell using the alternative cost.

const PT_TEXT =
  "Allosaurus Rider's power and toughness are each equal to 1 plus the number of lands you control.";

export default defineCard({
  name: "Allosaurus Rider",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 0,
  toughness: 0,
  alternativeCost: {
    mana: "{0}",
    exileFromHand: { filter: { colors: ["G"] }, count: 2, text: "two green cards" },
  },
  text: `You may exile two green cards from your hand rather than pay this spell's mana cost.\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", controlledBy: "you" } },
        plusPower: 1,
        plusToughness: 1,
      },
      text: PT_TEXT,
    },
  ],
});
