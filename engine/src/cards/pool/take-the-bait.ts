import { defineCard } from "../define.js";

// Rulings: the active player gets no additional main phase (end of combat
// straight to the next beginning of combat — `afterThisPhase`), and the
// untapped, goaded attackers stay in combat.

const ATTACKING = { type: "creature", attacking: true } as const;

export default defineCard({
  name: "Take the Bait",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Cast this spell only during combat on an opponent's turn.\nPrevent all combat damage that would be dealt to you and planeswalkers you control this turn. Untap all attacking creatures and goad them. After this phase, there is an additional combat phase.",
  castOnlyIf: {
    kind: "all",
    of: [{ kind: "not", of: { kind: "your-turn" } }, { kind: "turn-structure", duringCombat: true }],
  },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage-rule",
        to: { players: "you", permanents: { type: "planeswalker", controlledBy: "you" } },
        combat: true,
      },
      { kind: "untap-all", filter: ATTACKING },
      { kind: "goad", filter: ATTACKING },
      { kind: "additional-combat", afterThisPhase: true },
    ],
  },
});
