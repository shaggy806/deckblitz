import { defineCard } from "../define.js";

// Kaladesh. The keywords go to the first target whatever became of the
// second; the one-sided fight deals nothing if either is illegal (the rulings).
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
