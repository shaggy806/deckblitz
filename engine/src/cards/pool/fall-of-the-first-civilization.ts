import { defineCard } from "../define.js";

// Rulings:
//   If the target of the first chapter ability is an illegal target as the ability tries to
//   resolve, it won't resolve and none of its effects will happen. No player will draw cards.

const I_TEXT = "I — You and target opponent each draw two cards.";
const II_TEXT = "II — Exile target artifact an opponent controls.";
const III_TEXT = "III — Each player chooses three nonland permanents they control. Destroy all other nonland permanents.";

export default defineCard({
  name: "Fall of the First Civilization",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "draw", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [{ kind: "permanent", filter: { type: "artifact", controlledBy: "opponent" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            for: { permanent: { notTypes: ["land"], controlledBy: "you" }, own: true, count: 3, keep: true },
          },
          { kind: "destroy-all", filter: { notTypes: ["land"], notThisWay: "chosen" } },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
