import { defineCard } from "../define.js";

// Ruling (2022-09-09): the target's power is checked as the ability resolves
// too; once it has resolved, the creature can't block this turn even if its
// power grows.
const ATTACK_TEXT =
  "Whenever this creature attacks, target creature defending player controls with power less than this creature's power can't block this turn.";
const PUMP_TEXT =
  "Domain — {5}{R}: This creature gets +2/+2 until end of turn. This ability costs {1} less to activate for each basic land type among lands you control. Activate only once each turn.";

export default defineCard({
  name: "Radha's Firebrand",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: `${ATTACK_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "defending-player",
          filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
      costReduction: { reduceGeneric: { basicLandTypes: "you" } },
      oncePerTurn: true,
    },
  ],
});
