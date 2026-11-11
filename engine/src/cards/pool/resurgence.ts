import { defineCard } from "../define.js";

const FACES = ["Response // Resurgence", "Response", "Resurgence"];

// The right half of Response // Resurgence (see response-resurgence.ts).
//
// Rulings:
//   [2018-10-05] If you cast Resurgence when it's not a main phase (perhaps with Omnispell Adept's
//     ability), creatures you control gain first strike and vigilance, but there's no additional
//     combat phase or main phase. If you cast it during an opponent's main phase, there are
//     additional combat and main phases, but that player attacks during that combat phase, not
//     you.
//   [2018-10-05] Resurgence affects only creatures you control at the time it resolves.
//
// "After this main phase": nothing to come after when it resolves outside one.
export default defineCard({
  name: "Resurgence",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Creatures you control gain first strike and vigilance until end of turn. After this main phase, there is an additional combat phase followed by an additional main phase.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "vigilance",
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
        then: { kind: "additional-combat" },
      },
    ],
  },
  faces: FACES,
  split: true,
});
