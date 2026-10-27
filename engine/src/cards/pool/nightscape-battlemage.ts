import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 30770.
//
// Sunscape Battlemage's two kickers; the blue one's bounce is Captivating
// Gyre's shape for two, the creatures going back as one event.

const BOUNCE =
  "When this creature enters, if it was kicked with its {2}{U} kicker, return up to two target nonblack creatures to their owners' hands.";
const LAND = "When this creature enters, if it was kicked with its {2}{R} kicker, destroy target land.";

export default defineCard({
  name: "Nightscape Battlemage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}{U}", second: "{2}{R}" },
  text: `Kicker {2}{U} and/or {2}{R} (You may pay an additional {2}{U} and/or {2}{R} as you cast this spell.)\n${BOUNCE}\n${LAND}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "nonblack-creature" },
        { kind: "optional", of: { kind: "other", of: "nonblack-creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      resolve: null,
      text: BOUNCE,
      condition: { kind: "self-kicked", with: "first" },
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: LAND,
      condition: { kind: "self-kicked", with: "second" },
    },
  ],
});
