import { defineCard } from "../define.js";

// EDHREC rank 17285.
//
// Cast using teamwork is the kicked cast (rule 702.194c): its `effect`
// adds the trample to the same target.

export default defineCard({
  name: "Team Tactics",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 1,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      ],
    },
  },
  text:
    "Teamwork 1 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 1 or more.)\n" +
    "Target creature gains double strike until end of turn. If this spell was cast using teamwork, that creature also gains trample until end of turn.",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
});
