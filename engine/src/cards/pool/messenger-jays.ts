import { defineCard } from "../define.js";

// Council's dilemma: the vote, then the counters, then the draws, then one
// discard for each card drawn this way (the rulings' stated order).

const TEXT =
  "Council's dilemma — When this creature enters, starting with you, each player votes for feather or quill. Put a +1/+1 counter on this creature for each feather vote and draw a card for each quill vote. For each card drawn this way, discard a card.";

export default defineCard({
  name: "Messenger Jays",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["feather", "quill"] } },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { votesFor: 0 } },
          { kind: "draw", amount: { votesFor: 1 } },
          { kind: "discard", target: "you", amount: { thisWay: "drawn" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
