import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_ANY_TURN } from "../helpers.js";

const UNTAP_TEXT = "{T}: Untap target blue creature.";
const FORCE_TEXT =
  "{T}: Choose target non-Wall creature the active player has controlled continuously since the beginning of the turn. That creature attacks this turn if able. Destroy it at the beginning of the next end step if it didn't attack this turn. Activate only before attackers are declared.";

// Nettling Imp's ability, on any player's turn, your own included.
export default defineCard({
  name: "Norritt",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 1,
  toughness: 1,
  text: `${UNTAP_TEXT}\n${FORCE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", colors: ["U"] } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      condition: BEFORE_ATTACKERS_ANY_TURN,
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
      text: FORCE_TEXT,
    },
  ],
});
