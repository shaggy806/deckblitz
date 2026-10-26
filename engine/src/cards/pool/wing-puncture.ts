import { defineCard } from "../define.js";

// EDHREC rank 28305. Giantfall's one-sided fight, with the second target a
// creature with flying (anyone's).

export default defineCard({
  name: "Wing Puncture",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to target creature with flying.",
  targets: ["creature-you-control", { kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
