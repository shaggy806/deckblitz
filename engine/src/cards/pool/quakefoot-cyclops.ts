import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, up to two target creatures can't block this turn.";
const CYCLE_TEXT = "When you cycle this card, target creature can't block this turn.";

export default defineCard({
  name: "Quakefoot Cyclops",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 4,
  toughness: 4,
  cycling: { cost: "{1}{R}" },
  text: `${ENTERS_TEXT}\nCycling {1}{R} ({1}{R}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          { kind: "restrict", target: 1, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
