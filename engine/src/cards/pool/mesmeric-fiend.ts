import { defineCard } from "../define.js";

// Two linked triggers, not an "until" duration: if the Fiend leaves before
// its first ability resolves, its second does nothing and the card stays
// exiled for good (the ruling) — the exile is linked to the stint that left.

const ENTER_TEXT =
  "When this creature enters, target opponent reveals their hand and you choose a nonland card from it. Exile that card.";
const LEAVE_TEXT = "When this creature leaves the battlefield, return the exiled card to its owner's hand.";

export default defineCard({
  name: "Mesmeric Fiend",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
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
