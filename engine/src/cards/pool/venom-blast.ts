import { defineCard } from "../define.js";

// EDHREC rank 16997. The counters first, then the damage at its new power.
export default defineCard({
  name: "Venom Blast",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on target creature you control. It deals damage equal to its power to up to one other target creature.",
  targets: ["creature-you-control", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
