import { defineCard } from "../define.js";

// EDHREC rank 22778.
//
// "Those creatures" fixes the set as the ability resolves: the non-Wall
// creatures the active player controls then are the ones that must attack
// (`restrict`'s `asItResolves`, as Suicidal Charge's), and the same set is
// remembered for the delayed trigger (Tears of Rage's `onBattlefield`). A
// creature that arrives later is in neither; one that leaves and comes back
// is a new object (rule 400.7). "Didn't attack this turn" is read as the
// delayed trigger resolves. "Before combat" is the beginning phase and the
// first main phase (the untap step has no priority, rule 502.4).

const TEXT =
  "{T}: Non-Wall creatures the active player controls attack this turn if able. At the beginning of the next end step, destroy each of those creatures that didn't attack this turn. Activate only during an opponent's turn and only before combat.";

const THEIRS = { type: "creature", notSubtypes: ["Wall"], controlledBy: "active-player" } as const;

export default defineCard({
  name: "Maddening Imp",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "your-turn" } },
          {
            kind: "any",
            of: [
              { kind: "turn-structure", steps: ["upkeep", "draw"] },
              { kind: "turn-structure", mainPhase: 1 },
            ],
          },
        ],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", filter: THEIRS, asItResolves: true, restrictions: ["must-attack"] },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            remember: { those: { set: { onBattlefield: THEIRS } } },
            text: "Destroy each of those creatures that didn't attack this turn.",
            effect: { kind: "destroy-all", filter: { inSet: { remembered: "those" }, attackedThisTurn: false } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
