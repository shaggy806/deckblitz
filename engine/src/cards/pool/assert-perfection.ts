import { defineCard } from "../define.js";

// EDHREC rank 17084.
//
// Burrog Barrage's shape: "it deals damage equal to its power" is a one-sided
// fight with the second target, which is optional ("up to one"). The ruling:
// with either target illegal as it resolves, no damage is dealt.
const TEXT =
  "Target creature you control gets +1/+0 until end of turn. It deals damage equal to its power to up to one target creature an opponent controls.";

export default defineCard({
  name: "Assert Perfection",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
