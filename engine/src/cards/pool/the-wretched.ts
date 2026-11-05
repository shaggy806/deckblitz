import { defineCard } from "../define.js";

// EDHREC rank 28129.
//
// Rulings:
//   [2004-10-04] The ability grants you control of all creatures that are blocking it as the
//     ability resolves. This will include any creatures that were put onto the battlefield
//     blocking it.
//   [2004-10-04] Any blocking creatures that regenerated during combat will have been removed from
//     combat.
//   [2004-10-04] If The Wretched leaves the battlefield, you no longer control it, so the duration
//     of its control-change effect ends.
//   [2004-10-04] If you lose control of The Wretched before its ability resolves, you won't gain
//     control of the creatures blocking it at all.
//   [2004-10-04] Once the ability resolves, it doesn't care whether the permanents you gained
//     control of remain creatures, only that they remain on the battlefield.
//
// The blockers are read as it resolves (`for-each-permanent`), each taken for
// as long as you control The Wretched (`whileYouControlSource`).
const TEXT = "At end of combat, gain control of all creatures blocking this creature for as long as you control this creature.";

export default defineCard({
  name: "The Wretched",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 2,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        as: 0,
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
