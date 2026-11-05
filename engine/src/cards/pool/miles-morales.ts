import { defineCard } from "../define.js";

// EDHREC rank 7176.
const ETB_TEXT = "When Miles Morales enters, put a +1/+1 counter on each of up to two target creatures.";
const TRANSFORM_TEXT = "{3}{R}{G}{W}: Transform Miles Morales. Activate only as a sorcery.";

export default defineCard({
  name: "Miles Morales",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen", "Hero"],
  power: 1,
  toughness: 2,
  text: `${ETB_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R}{G}{W}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        together: true,
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  faces: ["Miles Morales", "Ultimate Spider-Man"],
});
