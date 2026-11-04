import { defineCard } from "../define.js";

// The Lord of the Rings: Tales of Middle-earth.
//
// Rulings:
//   Some cards refer to the "amassed Army." That means the Army creature you chose to receive
//     counters, even if no counters were placed on it for some reason.
//   You don't choose a target for Grishnákh's ability at the time it triggers. Rather, a second
//     "reflexive" ability triggers when you amass Orcs this way. You choose a target for that ability
//     as it goes on the stack. Each player may respond to this triggered ability as normal.
//
// The target's power is compared with the Army's as it's read: as the reflexive ability goes on the
// stack, and again as it resolves (rule 608.2b).

const REFLEXIVE =
  "When you do, until end of turn, gain control of target nonlegendary creature an opponent controls with power less than or equal to the amassed Army's power. Untap that creature. It gains haste until end of turn.";
const TEXT = `When Grishnákh enters, amass Orcs 2. ${REFLEXIVE}`;

export default defineCard({
  name: "Grishnákh, Brash Instigator",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "amass", amount: 2, creatureType: "Orc" },
          {
            kind: "reflexive-trigger",
            about: "amassed",
            targets: [
              {
                kind: "permanent",
                filter: {
                  type: "creature",
                  notSupertype: "legendary",
                  controlledBy: "opponent",
                  power: { op: "lte", n: { amount: { powerOf: "trigger-object" } } },
                },
              },
            ],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-control", target: 0, untilEndOfTurn: true },
                { kind: "untap", target: 0 },
                { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
              ],
            },
            text: REFLEXIVE,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
