import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 24467.

const PT_TEXT = "Uktabi Wildcats's power and toughness are each equal to the number of Forests you control.";

export default defineCard({
  name: "Uktabi Wildcats",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n{G}, Sacrifice a Forest: Regenerate this creature.`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: { filter: { subtype: "Forest" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}, Sacrifice a Forest: Regenerate this creature.",
    },
  ],
});
