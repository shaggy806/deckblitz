import { defineCard } from "../define.js";

// EDHREC rank 24753. An illegal target means no energy either (the ruling).

export default defineCard({
  name: "Highspire Infusion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +3/+3 until end of turn. You get {E}{E} (two energy counters).",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "get-energy", amount: 2 },
    ],
  },
});
