import { defineCard } from "../define.js";

// Each opponent chooses as this resolves, in turn order, knowing the choices
// before theirs (rule 101.4), and not a target: a hexproof creature can be
// chosen. Goaded by this spell's controller (rule 701.15).
const TEXT =
  "Each opponent chooses a creature they control. Tap and goad the chosen creatures. (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)";
const SPLICE =
  "Splice onto instant or sorcery {2}{U}{R} (As you cast an instant or sorcery spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)";

export default defineCard({
  name: "Fell Beast's Shriek",
  manaCost: "{U}{R}",
  colors: ["R", "U"],
  types: ["sorcery"],
  text: `${TEXT}\n${SPLICE}`,
  splice: { onto: "instant-or-sorcery", cost: "{2}{U}{R}" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: "each-opponent",
        for: {
          permanent: { type: "creature", controlledBy: "you" },
          own: true,
          prompt: "Choose a creature you control to be tapped and goaded",
        },
      },
      {
        kind: "for-each-voted",
        which: "voted",
        simultaneous: true,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "goad", target: 0 },
          ],
        },
      },
    ],
  },
});
