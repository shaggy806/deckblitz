import { defineCard } from "../define.js";

const GRANTED = "At the beginning of your upkeep, sacrifice this creature unless you pay {1}.";
const TEXT = `All creatures have "${GRANTED}"`;

export default defineCard({
  name: "Pendrell Mists",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "all-creatures" },
      // "You" in the granted ability is the creature's controller, on whose
      // upkeep it fires.
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "unless",
            chooser: "you",
            options: [{ pay: "{1}", text: "Pay {1}" }],
            otherwise: { kind: "sacrifice-source" },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
