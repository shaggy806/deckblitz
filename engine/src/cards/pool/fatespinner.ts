import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 6831.
//
// The opponent whose upkeep it is chooses as the trigger resolves (`as-player`
// over a `modal`, as Hall of Gemstone's color is), and skips every draw step,
// main phase or combat phase of the rest of this turn (`skip-step`'s
// `eachThisTurn`, rules 500.11, 614.10), one added later too.
//
// Rulings:
//   [2004-12-01] That opponent skips only the phases or steps that are chosen.
//   [2004-12-01] If there are multiple phases with the same name in the turn, your opponent skips
//     them all. This is true even if a new step or phase is added to the turn after the ability
//     resolves.
//   [2004-12-01] If more than one Fatespinner affects you at the start of your upkeep, you can
//     choose the same step or phase for each one.
const TEXT =
  "At the beginning of each opponent's upkeep, that player chooses draw step, main phase, or combat phase. The player skips each instance of the chosen step or phase this turn.";

export default defineCard({
  name: "Fatespinner",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "as-player",
        who: "active-player",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            { text: "Draw step", effect: { kind: "skip-step", step: "draw", eachThisTurn: true } },
            { text: "Main phase", effect: { kind: "skip-step", step: "main", eachThisTurn: true } },
            { text: "Combat phase", effect: { kind: "skip-step", step: "combat", eachThisTurn: true } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
