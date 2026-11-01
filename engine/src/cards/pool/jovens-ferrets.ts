import { defineCard } from "../define.js";

// The end-of-combat ability looks at the whole turn's blocks of this creature,
// so it also finds a blocker that was removed from combat. "They" stay tapped
// through their controller's next untap step, whoever's that is.

const ATTACKS = "Whenever this creature attacks, it gets +0/+2 until end of turn.";
const END_OF_COMBAT =
  "At end of combat, tap all creatures that blocked this creature this turn. They don't untap during their controller's next untap step.";

export default defineCard({
  name: "Joven's Ferrets",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ferret"],
  power: 1,
  toughness: 1,
  text: `${ATTACKS}\n${END_OF_COMBAT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: ATTACKS,
    },
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      targets: [],
      effect: {
        kind: "tap-all",
        filter: { type: "creature", blockedThisTurn: { relation: "blocked", of: "source" } },
        doesntUntapNext: true,
      },
      resolve: null,
      text: END_OF_COMBAT,
    },
  ],
});
