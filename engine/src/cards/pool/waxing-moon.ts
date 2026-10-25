import { defineCard } from "../define.js";

// EDHREC rank 14560.
//
// Its ruling: it may be cast with no Werewolf targeted; one targeted that
// becomes illegal leaves the spell with no legal target, so it doesn't
// resolve and grants no trample either (rule 608.2b).

export default defineCard({
  name: "Waxing Moon",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Transform up to one target Werewolf you control. Creatures you control gain trample until end of turn.",
  targets: [{ kind: "optional", of: { kind: "permanent", filter: { subtype: "Werewolf", controlledBy: "you" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "transform", target: 0 },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
