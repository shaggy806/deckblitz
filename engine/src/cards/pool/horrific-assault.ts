import { defineCard } from "../define.js";

// EDHREC rank 11016. Bite Down's one-sided fight, then the life: an illegal
// target on either side stops the damage, but while either target is still
// legal the spell resolves and the life gain happens (the ruling).
export default defineCard({
  name: "Horrific Assault",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control deals damage equal to its power to target creature or planeswalker you don't control. If you control an Eldrazi, you gain 3 life.",
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1, oneSided: true },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Eldrazi" }, atLeast: 1 },
        then: { kind: "gain-life", amount: 3 },
      },
    ],
  },
});
