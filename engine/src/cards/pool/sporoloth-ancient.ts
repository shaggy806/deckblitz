import { defineCard } from "../define.js";

// EDHREC rank 9274. Future Sight.
//
// The granted ability removes counters from the creature that has it (each
// creature's own "this creature"), and every creature you control has it,
// spore counters or not (the rulings).

const UPKEEP_TEXT = "At the beginning of your upkeep, put a spore counter on this creature.";
const GRANT_TEXT =
  "Creatures you control have \"Remove two spore counters from this creature: Create a 1/1 green Saproling creature token.\"";

export default defineCard({
  name: "Sporoloth Ancient",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "spore", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: false, removeCounter: { kind: "spore", count: 2 } },
          targets: [],
          effect: { kind: "create-token", token: "Saproling Token", count: 1 },
          resolve: null,
          text: "Remove two spore counters from this creature: Create a 1/1 green Saproling creature token.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
