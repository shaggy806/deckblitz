import { defineCard } from "../define.js";

// The intervening "if" is asked as it triggers and as it resolves (rule 603.4):
// one that has left in response returns nothing. Any card named Myr Servitor
// from every graveyard, each under its owner's control.

const TEXT =
  "At the beginning of your upkeep, if this creature is on the battlefield, each player returns all cards named Myr Servitor from their graveyard to the battlefield.";

export default defineCard({
  name: "Myr Servitor",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-zone", zones: ["battlefield"], sameObject: true },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        from: "each-graveyard",
        filter: { hasName: "Myr Servitor" },
        destination: "battlefield",
        count: "all",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
