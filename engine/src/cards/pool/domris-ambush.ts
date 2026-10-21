import { defineCard } from "../define.js";

// Both targets are required. An illegal second target still leaves the
// counter on the first; an illegal first target gets no counter and deals no
// damage (the rulings).
export default defineCard({
  name: "Domri's Ambush",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control. Then that creature deals damage equal to its power to target creature or planeswalker you don't control.",
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
