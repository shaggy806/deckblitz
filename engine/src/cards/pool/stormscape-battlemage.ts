import { defineCard } from "../define.js";

// EDHREC rank 29576.
//
// Rulings:
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.

export default defineCard({
  name: "Stormscape Battlemage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Metathran", "Wizard"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{W}", second: "{2}{B}" },
  text: "Kicker {W} and/or {2}{B} (You may pay an additional {W} and/or {2}{B} as you cast this spell.)\nWhen this creature enters, if it was kicked with its {W} kicker, you gain 3 life.\nWhen this creature enters, if it was kicked with its {2}{B} kicker, destroy target nonblack creature. That creature can't be regenerated.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {W} kicker, you gain 3 life.",
      condition: { kind: "self-kicked", with: "first" },
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {2}{B} kicker, destroy target nonblack creature. That creature can't be regenerated.",
      condition: { kind: "self-kicked", with: "second" },
    },
  ],
});
