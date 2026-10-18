import { defineCard } from "../define.js";

// EDHREC rank 12701.
//
// The number of targets and the split are chosen as it's cast, each target
// getting at least one counter (rule 601.2d — the rulings); a target gone
// illegal loses its share. The keyword grant reaches every creature you
// control as it resolves (rule 611.2c), unless every target is illegal and
// the spell doesn't resolve at all (rule 608.2b — the ruling).
//
// Rulings:
//   [2023-04-14] If all of Storm the Seedcore's targets are illegal at the time the spell tries to
//     resolve, it won't resolve and none of its effects will happen. Creatures you control won't
//     gain vigilance and trample.
//   [2023-04-14] You choose how many targets Storm the Seedcore has and how the counters will be
//     distributed as you cast the spell. Each target must receive at least one counter.
//   [2023-04-14] If some of the creatures are illegal targets as Storm the Seedcore tries to
//     resolve, the original distribution of counters still applies and the counters that would
//     have been put on the illegal targets are lost. They won't be put instead on a legal target.

export default defineCard({
  name: "Storm the Seedcore",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Distribute four +1/+1 counters among up to four target creatures you control. Creatures you control gain vigilance and trample until end of turn.",
  targets: [{ kind: "any-number", of: "creature-you-control", min: 0, max: 4 }],
  divided: { total: 4, slot: 0, of: "+1/+1 counters" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counters-divided", from: 0, counter: "+1/+1" },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "vigilance",
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
