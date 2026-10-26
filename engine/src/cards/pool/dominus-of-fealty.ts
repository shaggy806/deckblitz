import { defineCard } from "../define.js";

// EDHREC rank 12099.
//
// Rulings:
//   [2008-08-01] If you already control the targeted permanent when the ability resolves, you
//     still need to choose whether or not to apply the effect. If you choose to apply it, the
//     permanent untaps and gains haste. If you don’t, it doesn’t.
//
// The "you may" wraps the whole effect, so it's asked even when you already
// control the target (the ruling), and "if you do" is the rest of the same may.

export default defineCard({
  name: "Dominus of Fealty",
  manaCost: "{U/R}{U/R}{U/R}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, you may gain control of target permanent until end of turn. If you do, untap it and it gains haste until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["permanent"],
      effect: {
        kind: "may",
        prompt: "Gain control of the target permanent until end of turn, untap it and give it haste?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 0, untilEndOfTurn: true },
            { kind: "untap", target: 0 },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may gain control of target permanent until end of turn. If you do, untap it and it gains haste until end of turn.",
    },
  ],
});
