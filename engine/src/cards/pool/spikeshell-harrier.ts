import { defineCard } from "../define.js";

// EDHREC rank 22719.
//
// "That opponent" is the controller of the targeted creature or Vehicle,
// read while it is still on the battlefield: the speed check and reduction
// come first in the sequence, which changes nothing else (returning a
// permanent touches no player's speed, and a single illegal target stops the
// whole ability either way). A player with no speed has speed 0 for the
// comparison (rule 702.179f), so it's never the greatest unless someone else
// has less — and it has no speed to reduce. In a free-for-all, each other
// player is an opponent of that opponent (rule 102.3).

const TEXT =
  "When this creature enters, return target creature or Vehicle an opponent controls to its owner's hand. If that opponent's speed is greater than each other player's speed, reduce that opponent's speed by 1. This effect can't reduce their speed below 1.";

export default defineCard({
  name: "Spikeshell Harrier",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Turtle"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "opponent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: {
              kind: "of-player",
              player: { controllerOf: 0 },
              condition: { kind: "player-compare", stat: "speed", compare: "more", than: "each-opponent" },
            },
            then: { kind: "reduce-speed", who: { controllerOf: 0 }, amount: 1, floor: 1 },
          },
          { kind: "return-to-hand", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
