import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 10640.
//
// Rabid Bite's one-sided fight after the keyword grants: with the second
// target gone illegal the first still gains vigilance and trample, and the
// fight deals no damage (the rulings).
export default defineCard({
  name: "Nature's Way",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control gains vigilance and trample until end of turn. It deals damage equal to its power to target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
