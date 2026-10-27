import { defineCard } from "../define.js";

// EDHREC rank 31182.

export default defineCard({
  name: "Sunscape Battlemage",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{1}{G}", second: "{2}{U}" },
  text: "Kicker {1}{G} and/or {2}{U} (You may pay an additional {1}{G} and/or {2}{U} as you cast this spell.)\nWhen this creature enters, if it was kicked with its {1}{G} kicker, destroy target creature with flying.\nWhen this creature enters, if it was kicked with its {2}{U} kicker, draw two cards.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {1}{G} kicker, destroy target creature with flying.",
      condition: { kind: "self-kicked", with: "first" },
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {2}{U} kicker, draw two cards.",
      condition: { kind: "self-kicked", with: "second" },
    },
  ],
});
