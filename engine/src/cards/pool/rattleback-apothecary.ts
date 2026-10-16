import { defineCard } from "../define.js";

// EDHREC rank 11504.
//
// Rulings:
//   [2024-04-12] You choose which ability the target creature gets as Rattleback Apothecary's
//     triggered ability resolves.
//
// The choice on resolution is a resolution-time `modal` (Steel Seraph's shape).

const CRIME_TEXT =
  "Whenever you commit a crime, target creature you control gains your choice of menace or lifelink until end of turn.";

export default defineCard({
  name: "Rattleback Apothecary",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon", "Warlock"],
  power: 3,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Menace",
            effect: { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
          },
          {
            text: "Lifelink",
            effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: CRIME_TEXT,
    },
  ],
});
