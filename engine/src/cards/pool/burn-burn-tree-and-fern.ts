import { defineCard } from "../define.js";

// EDHREC rank 15747.

const I_TEXT = "I — This Saga deals 6 damage to target creature an opponent controls.";
const II_TEXT = "II — Destroy target artifact an opponent controls.";
const III_IV_TEXT = "III, IV — Add {R}.";

export default defineCard({
  name: "Burn, Burn, Tree and Fern",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${III_IV_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 6, target: 0 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "artifact" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3, 4],
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: III_IV_TEXT,
    },
  ],
});
