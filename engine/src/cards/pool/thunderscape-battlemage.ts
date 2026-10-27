import { defineCard } from "../define.js";

// EDHREC rank 31007.

export default defineCard({
  name: "Thunderscape Battlemage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{1}{B}", second: "{G}" },
  text: "Kicker {1}{B} and/or {G} (You may pay an additional {1}{B} and/or {G} as you cast this spell.)\nWhen this creature enters, if it was kicked with its {1}{B} kicker, target player discards two cards.\nWhen this creature enters, if it was kicked with its {G} kicker, destroy target enchantment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {1}{B} kicker, target player discards two cards.",
      condition: { kind: "self-kicked", with: "first" },
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {G} kicker, destroy target enchantment.",
      condition: { kind: "self-kicked", with: "second" },
    },
  ],
});
