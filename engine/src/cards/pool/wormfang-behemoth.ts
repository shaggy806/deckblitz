import { defineCard } from "../define.js";

// The whole hand is exiled linked to it (`exile-graveyard`'s `fromHand:
// "only"`) and goes back to its owner's hand when it leaves.

const ENTER_TEXT = "When this creature enters, exile all cards from your hand.";
const LEAVE_TEXT = "When this creature leaves the battlefield, return the exiled cards to their owner's hand.";

export default defineCard({
  name: "Wormfang Behemoth",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Fish", "Beast"],
  power: 5,
  toughness: 5,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-graveyard", target: "you", fromHand: "only", linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
