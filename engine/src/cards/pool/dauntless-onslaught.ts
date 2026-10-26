import { defineCard } from "../define.js";

export default defineCard({
  name: "Dauntless Onslaught",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Up to two target creatures each get +2/+2 until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
});
