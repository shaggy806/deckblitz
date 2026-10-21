import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 10242.
//
// Rulings:
//   [2018-06-08] Krav can be sacrificed to pay the cost for its own ability. The +1/+1 counters
//     won't be put on anything.
//   [2018-06-08] The triggered ability of the "partner with" keyword still triggers in a Commander
//     game. If your other commander has somehow ended up in your library, you can find it. You can
//     also target another player who might have that card in their library.
//
// Grim Hireling's "Sacrifice X" cost (any creatures, Krav included); the
// counters go on the source, which does nothing once Krav has left.

const ABILITY_TEXT = "{B}, Sacrifice X creatures: Target player draws X cards and gains X life. Put X +1/+1 counters on Krav.";

export default defineCard({
  name: "Krav, the Unredeemed",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 3,
  pairing: { kind: "partner-with", name: "Regna, the Redeemer" },
  text: `Partner with Regna, the Redeemer (When this creature enters, target player may put Regna into their hand from their library, then shuffle.)\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: { filter: { type: "creature" }, count: "x" } },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: "x", target: 0 },
          { kind: "gain-life", amount: "x", toControllerOfTarget: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Regna, the Redeemer?",
        effect: {
          kind: "search-library",
          filter: { name: "Regna, the Redeemer" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Regna, the Redeemer, reveal it, put it into their hand, then shuffle.",
    },
  ],
});
