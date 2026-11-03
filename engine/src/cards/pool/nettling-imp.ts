import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_ANY_TURN } from "../helpers.js";

const TEXT =
  "{T}: Choose target non-Wall creature the active player has controlled continuously since the beginning of the turn. That creature attacks this turn if able. Destroy it at the beginning of the next end step if it didn't attack this turn. Activate only during an opponent's turn, before attackers are declared.";

// The "if" comes after the trigger's event, so it's read as the delayed
// trigger resolves (rule 603.4 is for one right after it).
export default defineCard({
  name: "Nettling Imp",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "all", of: [{ kind: "not", of: { kind: "your-turn" } }, BEFORE_ATTACKERS_ANY_TURN] },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", notSubtypes: ["Wall"], controlledBy: "active-player", controlledContinuously: true },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["must-attack"] },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Destroy it if it didn't attack this turn.",
            effect: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { attackedThisTurn: false } },
              then: { kind: "destroy", target: 0 },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
