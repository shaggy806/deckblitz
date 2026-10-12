import { defineCard } from "../define.js";

// EDHREC rank 15886. Marvel Super Heroes. II is one damage event to the
// creatures and the opponents (Chandra's Ignition's `simultaneous`
// sequence). III counts the Villains as it resolves.

const I_TEXT = "I — Create two 2/1 black Villain creature tokens with menace.";
const II_TEXT = "II — This Saga deals 2 damage to each non-Villain creature and each opponent.";
const III_TEXT = "III — Create a Treasure token for each Villain you control.";

export default defineCard({
  name: "Avengers: Under Siege",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 2 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", notSubtypes: ["Villain"] }, amount: 2 },
          { kind: "damage", amount: 2, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { countOf: { subtype: "Villain", controlledBy: "you" } },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
