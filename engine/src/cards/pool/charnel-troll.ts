import { defineCard } from "../define.js";

// EDHREC rank 29166.
//
// The exile isn't optional: with a creature card in your graveyard you must
// exile one (the ruling), then the counter; with none — or if nothing was
// exiled — the Troll is sacrificed. Its discard ability can be activated in
// response, during the upkeep (the rulings).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile a creature card from your graveyard. If you do, put a +1/+1 counter on this creature. Otherwise, sacrifice it.";
const DISCARD_TEXT = "{B}{G}, Discard a creature card: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Charnel Troll",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${UPKEEP_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "creature" } },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              filter: { type: "creature" },
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
              else: { kind: "sacrifice-source" },
            },
          ],
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{G}", tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
