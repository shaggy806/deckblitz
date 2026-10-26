import { defineCard } from "../define.js";

// EDHREC rank 24715.
//
// Rulings:
//   [2004-10-04] If two or more Aura Fluxes are on the battlefield, they will give the text to
//     each other. And they will cause each other enchantment to have two triggered abilities for
//     which the player would have to pay.
//   [2004-10-04] You choose whether to pay {2} or not on resolution. If not, then you sacrifice
//     the enchantment.
//   [2004-10-04] This card adds a triggered ability to all other enchantments.

const GRANTED = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {2}.";
const TEXT = `Other enchantments have "${GRANTED}"`;

export default defineCard({
  name: "Aura Flux",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      // Every other enchantment, whoever controls it; "you" in the granted
      // ability is that enchantment's controller (Pendrell Mists' shape).
      affects: { scope: "filter", filter: { type: "enchantment" }, excludeSelf: true },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "unless",
            chooser: "you",
            options: [{ pay: "{2}", text: "Pay {2}" }],
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
