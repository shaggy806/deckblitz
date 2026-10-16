import { defineCard } from "../define.js";

// EDHREC rank 23382. Scrollboost's "one or two target creatures".

export default defineCard({
  name: "Hearts on Fire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "One or two target creatures each get +2/+1 until end of turn.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 1, duration: "end-of-turn" },
    ],
  },
});
