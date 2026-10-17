import { defineCard } from "../define.js";

// EDHREC rank 8439.
//
// Rabid Bite's one-sided fight, then a Food. With only one of the two
// creatures still a legal target, nobody deals or is dealt damage but the
// Food is still made (rule 608.2b); with neither, the spell doesn't resolve.

export default defineCard({
  name: "Stew the Coneys",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to target creature you don't control. Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1, oneSided: true },
      { kind: "create-token", token: "Food Token", count: 1 },
    ],
  },
});
