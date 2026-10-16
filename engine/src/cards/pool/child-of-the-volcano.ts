import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Enterprising Scallywag's "if you descended
// this turn": an intervening "if" read off the turn's record of permanent
// cards put into your graveyard, so it triggers once however many times
// you descended, and not at all if you haven't by the end step (the rulings).

const TEXT =
  "At the beginning of your end step, if you descended this turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Child of the Volcano",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT} (You descended if a permanent card was put into your graveyard from anywhere.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "descended" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
