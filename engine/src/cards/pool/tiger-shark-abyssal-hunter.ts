import { defineCard } from "../define.js";

// EDHREC rank 24045.
//
// "Enters or attacks" is two triggers (Scurrilous Sentry's shape).
const CONNIVE_TEXT =
  "Whenever Tiger Shark enters or attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)";
const UNBLOCKABLE_TEXT = "{4}{U/B}: Tiger Shark can't be blocked this turn.";

export default defineCard({
  name: "Tiger Shark, Abyssal Hunter",
  manaCost: "{2}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shark", "Human", "Villain"],
  power: 2,
  toughness: 3,
  text: `${CONNIVE_TEXT}\n${UNBLOCKABLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{U/B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever Tiger Shark enters or attacks, he connives.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever Tiger Shark enters or attacks, he connives.",
    },
  ],
});
