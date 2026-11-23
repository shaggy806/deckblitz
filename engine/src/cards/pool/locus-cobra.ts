import { defineCard } from "../define.js";

// Playtest card. Lotus Cobra's landfall mana, then a counter if the land that
// entered was a Locus or a Sphere (read as it last existed, if it has left).

const TEXT =
  "Landfall — Whenever a land enters the battlefield under your control, add one mana of any color. If it was a Locus or Sphere land, put a +1/+1 counter on Locus Cobra.";

export default defineCard({
  name: "Locus Cobra",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Snake"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "any-color", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { subtypes: ["Locus", "Sphere"] } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
