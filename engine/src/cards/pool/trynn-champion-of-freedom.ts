import { defineCard } from "../define.js";

export default defineCard({
  name: "Trynn, Champion of Freedom",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  pairing: { kind: "partner-with", name: "Silvar, Devourer of the Free" },
  text: "Partner with Silvar, Devourer of the Free (When this creature enters, target player may put Silvar into their hand from their library, then shuffle.)\nAt the beginning of your end step, if you attacked this turn, create a 1/1 white Human Soldier creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        // "… **may** search": that player's choice (`each-player-may`), so
        // declining neither searches nor shuffles their library.
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Silvar, Devourer of the Free?",
        effect: {
          kind: "search-library",
          filter: { name: "Silvar, Devourer of the Free" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Silvar, Devourer of the Free, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you attacked this turn, create a 1/1 white Human Soldier creature token.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
