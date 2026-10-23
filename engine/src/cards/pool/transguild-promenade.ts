import { defineCard } from "../define.js";

// EDHREC rank 8152.

const TAPPED_TEXT = "This land enters tapped.";
const SAC_TEXT = "When this land enters, sacrifice it unless you pay {1}.";

export default defineCard({
  name: "Transguild Promenade",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n${SAC_TEXT}\n{T}: Add one mana of any color.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{1}", text: "Pay {1}." }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: TAPPED_TEXT,
    },
  ],
});
