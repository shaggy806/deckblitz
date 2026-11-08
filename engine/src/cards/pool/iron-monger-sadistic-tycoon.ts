import { defineCard } from "../define.js";

const CONNIVES_TEXT = "Whenever a creature you control connives, put a +1/+1 counter on each Villain you control.";

// The generic connive trigger (`{ on: "event", event: "connives" }`, B278).
export default defineCard({
  name: "Iron Monger, Sadistic Tycoon",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${CONNIVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "connives", who: "you-control" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Villain", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: CONNIVES_TEXT,
    },
  ],
});
