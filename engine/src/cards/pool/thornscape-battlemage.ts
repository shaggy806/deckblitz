import { defineCard } from "../define.js";

// EDHREC rank 29461.

export default defineCard({
  name: "Thornscape Battlemage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{R}", second: "{W}" },
  text: "Kicker {R} and/or {W} (You may pay an additional {R} and/or {W} as you cast this spell.)\nWhen this creature enters, if it was kicked with its {R} kicker, it deals 2 damage to any target.\nWhen this creature enters, if it was kicked with its {W} kicker, destroy target artifact.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {R} kicker, it deals 2 damage to any target.",
      condition: { kind: "self-kicked", with: "first" },
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {W} kicker, destroy target artifact.",
      condition: { kind: "self-kicked", with: "second" },
    },
  ],
});
