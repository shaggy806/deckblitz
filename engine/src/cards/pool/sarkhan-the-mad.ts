import { defineCard } from "../define.js";

// EDHREC rank 18925. The Dragon comes even if the creature couldn't be
// sacrificed (the ruling), under its last-known controller.
const ZERO_TEXT =
  "0: Reveal the top card of your library and put it into your hand. Sarkhan deals damage to himself equal to that card's mana value.";
const MINUS_TEXT =
  "−2: Target creature's controller sacrifices it, then that player creates a 5/5 red Dragon creature token with flying.";
const ULT_TEXT = "−4: Each Dragon creature you control deals damage equal to its power to target player or planeswalker.";

export default defineCard({
  name: "Sarkhan the Mad",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sarkhan"],
  loyalty: 7,
  text: `${ZERO_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        reveal: true,
        then: { kind: "damage", target: "source", amount: { manaValueOf: 0 } },
      },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-target", target: 0, byItsController: true },
          { kind: "create-token", token: "Dragon Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "each-deals-damage",
        filter: { subtype: "Dragon", type: "creature", controlledBy: "you" },
        amount: "its-power",
        to: 0,
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
