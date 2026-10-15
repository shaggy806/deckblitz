import { defineCard } from "../define.js";

// EDHREC rank 27499.
//
// Brokers Charm's one-sided fight: only the first creature deals damage, and
// it reads its power after the +X/+0.

export default defineCard({
  name: "Bionic Blow",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature you control gets +X/+0 until end of turn. Then it deals damage equal to its power to up to one other target creature.",
  targets: ["creature-you-control", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
