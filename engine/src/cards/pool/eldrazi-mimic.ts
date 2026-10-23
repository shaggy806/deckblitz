import { defineCard } from "../define.js";

const TEXT =
  "Whenever another colorless creature you control enters, you may have this creature's base power and toughness become equal to that creature's power and toughness until end of turn.";

export default defineCard({
  name: "Eldrazi Mimic",
  manaCost: "{2}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", colorless: true },
      },
      targets: [],
      // The entering creature's P/T as the ability resolves — as it last
      // existed if it has left (the ruling).
      effect: {
        kind: "may",
        prompt: "Have Eldrazi Mimic's base power and toughness become that creature's until end of turn?",
        effect: {
          kind: "animate",
          target: "source",
          power: { powerOf: "trigger-object" },
          toughness: { toughnessOf: "trigger-object" },
          addTypes: [],
          addSubtypes: [],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
