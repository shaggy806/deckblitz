import { defineCard } from "../define.js";

// EDHREC rank 8704.
//
// Rulings:
//   [2009-05-01] Finest Hour's second ability has an "intervening 'if' clause." The ability won't
//     trigger at all unless it's the first combat phase of the turn.
//   [2009-05-01] Unlike other similar cards, Finest Hour doesn't create a main phase in between
//     the two combat phases. The second combat phase will begin immediately after the current one
//     ends.
const COMBAT_TEXT =
  "Whenever a creature you control attacks alone, if it's the first combat phase of the turn, untap that creature. After this phase, there is an additional combat phase.";

export default defineCard({
  name: "Finest Hour",
  manaCost: "{2}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["enchantment"],
  text: `Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Exalted",
    },
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      condition: { kind: "turn-structure", combatPhase: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "trigger-object" },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
