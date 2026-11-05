import { defineCard } from "../define.js";

// The whole hand is exiled linked to Hypnox (`exile-graveyard`'s
// `fromHand: "only"`), and goes back to its owner's hand when it leaves. A
// copy that was cast from the hand triggers too (the ruling).

const ENTER_TEXT = "When this creature enters, if you cast it from your hand, exile all cards from target opponent's hand.";
const LEAVE_TEXT = "When this creature leaves the battlefield, return the exiled cards to their owner's hand.";

export default defineCard({
  name: "Hypnox",
  manaCost: "{8}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 8,
  toughness: 8,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: ["opponent"],
      effect: { kind: "exile-graveyard", target: 0, fromHand: "only", linked: true },
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
