import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 24927.

export default defineCard({
  name: "Leap of Flame",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Replicate {U}{R} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nTarget creature gets +1/+0 and gains flying and first strike until end of turn.",
  kicker: { cost: "{U}{R}", keyword: "replicate", multi: true },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
