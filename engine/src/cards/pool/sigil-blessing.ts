import { defineCard } from "../define.js";

// "Target creature you control gets +3/+3 and other creatures you control get
// +1/+1": the target is a creature you control as this resolves (else the
// spell doesn't resolve — its ruling), so it is +1/+1 with every creature you
// control and +2/+2 more on its own — +3/+3 in all, the rest +1/+1, the set
// locked in as it resolves (rule 611.2c), all in layer 7c.
export default defineCard({
  name: "Sigil Blessing",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Until end of turn, target creature you control gets +3/+3 and other creatures you control get +1/+1.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
});
