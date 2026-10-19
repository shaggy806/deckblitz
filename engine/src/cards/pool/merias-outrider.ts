import { defineCard } from "../define.js";

// Domain: the basic land types among lands you control, counted as the
// trigger resolves.

const ENTER_TEXT =
  "Domain — When this creature enters, it deals damage to each opponent equal to the number of basic land types among lands you control.";

export default defineCard({
  name: "Meria's Outrider",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: { basicLandTypes: "you" }, who: "each-opponent" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
