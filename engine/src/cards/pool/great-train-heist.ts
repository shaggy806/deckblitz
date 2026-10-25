import { defineCard } from "../define.js";

// Spree. The first mode's additional combat comes only in your own combat
// phase (rule 500.8); cast in a main phase it just untaps. The third is a
// delayed triggered ability lasting the turn (rule 603.7c), once per
// creature that deals combat damage to the chosen opponent.
const UNTAP_MODE =
  "+ {2}{R} — Untap all creatures you control. If it's your combat phase, there is an additional combat phase after this phase.";
const PUMP_MODE = "+ {2} — Creatures you control get +1/+0 and gain first strike until end of turn.";
const TREASURE_MODE =
  "+ {R} — Choose target opponent. Whenever a creature you control deals combat damage to that player this turn, create a tapped Treasure token.";

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Great Train Heist",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Spree (Choose one or more additional costs.)\n${UNTAP_MODE}\n${PUMP_MODE}\n${TREASURE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      {
        text: UNTAP_MODE,
        spreeCost: "{2}{R}",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap-all", filter: YOURS },
            {
              kind: "conditional",
              condition: {
                kind: "all",
                of: [
                  { kind: "your-turn" },
                  {
                    kind: "turn-structure",
                    steps: ["begin-combat", "declare-attackers", "declare-blockers", "combat-damage", "end-combat"],
                  },
                ],
              },
              then: { kind: "additional-combat", afterThisPhase: true },
            },
          ],
        },
      },
      {
        text: PUMP_MODE,
        spreeCost: "{2}",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: YOURS, keyword: "first-strike", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: TREASURE_MODE,
        spreeCost: "{R}",
        targets: ["opponent"],
        effect: {
          kind: "delayed-trigger",
          at: {
            whenever: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
            toPlayer: 0,
          },
          effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
          text: "Whenever a creature you control deals combat damage to that player this turn, create a tapped Treasure token.",
        },
      },
    ],
  },
});
