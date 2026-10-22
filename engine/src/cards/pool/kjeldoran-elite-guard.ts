import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31533.
//
// "When that creature leaves the battlefield this turn" is a delayed trigger
// set up as the ability resolves, watching the target's stint (War Barge's
// shape, on target slot 0); it sacrifices the Guard itself.

const TEXT =
  "{T}: Target creature gets +2/+2 until end of turn. When that creature leaves the battlefield this turn, sacrifice this creature. Activate only during combat.";

export default defineCard({
  name: "Kjeldoran Elite Guard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      condition: { kind: "turn-structure", duringCombat: true },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard", "exile", "hand", "library", "command"], thisTurn: true },
            effect: { kind: "sacrifice-source" },
            text: "When that creature leaves the battlefield this turn, sacrifice Kjeldoran Elite Guard.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
