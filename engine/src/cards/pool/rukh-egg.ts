import { defineCard } from "../define.js";

// EDHREC rank 21198. The dies trigger sets up a delayed trigger for the next
// end step (rule 603.7), controlled by the Egg's controller as it died (its
// ruling: "the controller of the Egg gets the Bird"); nothing about the Egg
// card matters after that, so a card that left the graveyard still makes the
// Bird, and an Egg exiled instead never triggers.

const TEXT =
  "When this creature dies, create a 4/4 red Bird creature token with flying at the beginning of the next end step.";

export default defineCard({
  name: "Rukh Egg",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird", "Egg"],
  power: 0,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "create-token", token: "4/4 Red Bird Token", count: 1 },
        text: "Create a 4/4 red Bird creature token with flying.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
