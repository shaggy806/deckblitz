import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, target player exiles all cards from their hand face down, then draws that many cards.";
const LEAVE_TEXT = "When this enchantment is put into a graveyard from the battlefield, return the exiled cards to their owner's hand.";

// Linked abilities (rule 607.2a): gone before the first resolves, or anywhere
// but a graveyard, and the cards stay exiled.

export default defineCard({
  name: "Induced Amnesia",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: 0, fromHand: "only", faceDown: true, linked: true },
          { kind: "draw", target: 0, amount: { thisWay: "exiled" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
