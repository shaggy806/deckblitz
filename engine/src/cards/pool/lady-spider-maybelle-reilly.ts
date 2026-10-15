import { defineCard } from "../define.js";

// EDHREC rank 22921.
//
// One trigger per card discarded (Ivora, Insatiable Heir's shape), each with
// its own target.
const DISCARD_TEXT = "Whenever you discard a card, put a +1/+1 counter on target Spider you control.";

export default defineCard({
  name: "Lady Spider, Maybelle Reilly",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Spider" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
