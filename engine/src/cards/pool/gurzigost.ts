import { defineCard } from "../define.js";

// Anurid Scavenger's upkeep, two cards: with two there, you choose — put two
// (which, and their order on the bottom, yours: rule 401.4) or sacrifice;
// with fewer there's nothing to put, and it's sacrificed.
const UPKEEP =
  "At the beginning of your upkeep, sacrifice this creature unless you put two cards from your graveyard on the bottom of your library.";
const UNBLOCKED =
  "{G}{G}, Discard a card: You may have this creature assign its combat damage this turn as though it weren't blocked.";

export default defineCard({
  name: "Gurzigost",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 8,
  text: `${UPKEEP}\n${UNBLOCKED}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Put two cards from your graveyard on the bottom of your library? (If you don't, sacrifice Gurzigost.)",
          effect: {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 2,
            max: 2,
            destination: "library-bottom",
            leftover: "stay",
          },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "assign-as-though-unblocked", target: "source", optional: true },
      resolve: null,
      text: UNBLOCKED,
    },
  ],
});
