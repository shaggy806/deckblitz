import { defineCard } from "../define.js";

// EDHREC rank 22754.
//
// Rulings:
//   [2024-04-12] Stagecoach Security's triggered ability affects only creatures you control at the
//     time it resolves.

const ETB_TEXT = "When this creature enters, creatures you control get +1/+1 and gain vigilance until end of turn.";

export default defineCard({
  name: "Stagecoach Security",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 5,
  plot: { cost: "{3}{W}" },
  text: `${ETB_TEXT}\nPlot {3}{W} (You may pay {3}{W} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
