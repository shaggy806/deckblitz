import { defineCard } from "../define.js";

// EDHREC rank 16130.
//
// "All other creatures": every creature but this one as the trigger resolves
// (rule 611.2c), the `exceptSource` clause.

const TEXT = "When this creature enters, all other creatures get -2/-2 until end of turn.";

export default defineCard({
  name: "Shefet Archfiend",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{2}" },
  text: `Flying\n${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
