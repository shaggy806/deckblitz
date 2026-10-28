import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you lose 2 life and exile the top card of your library. You may play that card for as long as it remains exiled.";
const CONSPIRE_TEXT =
  "Each noncreature spell you cast from exile has conspire. (As you cast that spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose new targets for the copy.)";

export default defineCard({
  name: "Rassilon, the War President",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Noble"],
  power: 3,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n${CONSPIRE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "you" },
          { kind: "impulse-exile", amount: 1, duration: "while-exiled" },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { notTypes: ["creature"] }, castFrom: ["exile"], conspire: true },
      text: CONSPIRE_TEXT,
    },
  ],
});
