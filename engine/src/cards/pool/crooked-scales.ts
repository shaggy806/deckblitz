import { defineCard } from "../define.js";

// EDHREC rank 14816.
//
// Both targets are chosen as it's activated, so it can be activated only
// with both to choose; a repeat doesn't choose them again (the rulings). One
// pass is a flip: won, the opponent's creature is destroyed and the process
// ends; lost, its controller may pay {3} to flip again (the `repeat`'s
// `mayAgain`, asked only after a lost flip). The process ends lost only when
// that payment is declined (or can't be made), and then their own creature
// is destroyed — read after the passes as "no flip won" (rule 705), since a
// won flip always ends it.
const TEXT =
  "{4}, {T}: Flip a coin. If you win the flip, destroy target creature an opponent controls. If you lose the flip, destroy target creature you control unless you pay {3} and repeat this process.";

export default defineCard({
  name: "Crooked Scales",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["creature-an-opponent-controls", "creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "repeat",
            effect: { kind: "flip-coin", won: { kind: "destroy", target: 0 } },
            again: { kind: "this-way", what: "flips-lost", atLeast: 1 },
            mayAgain: { cost: "{3}", prompt: "Pay {3} and repeat this process? If you don't, your creature is destroyed." },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "flips-won", atMost: 0 },
            then: { kind: "destroy", target: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
