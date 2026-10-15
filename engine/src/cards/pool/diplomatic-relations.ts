import { defineCard } from "../define.js";

// EDHREC rank 18271. Brokers Charm's shape, plus vigilance.

export default defineCard({
  name: "Diplomatic Relations",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 and gains vigilance until end of turn. It deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
