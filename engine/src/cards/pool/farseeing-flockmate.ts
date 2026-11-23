import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// A playtest card (Mystery Booster 2). Flying backup is backup (rule
// 702.165a) with a flying counter for the +1/+1 counter: the target gets the
// counter, and another creature gains the ability printed below it until end
// of turn. "A player, planeswalker, or battle" is two trigger events — a
// player or battle, and a planeswalker — since `to: "player"` never matches a
// planeswalker.

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, planeswalker, or battle, surveil 1.";

const DAMAGE: readonly TriggeredAbility[] = [
  {
    trigger: { on: "deals-damage", who: "self", to: "player", orBattle: true, combat: true },
    targets: [],
    effect: { kind: "surveil", amount: 1 },
    resolve: null,
    text: DAMAGE_TEXT,
  },
  {
    trigger: { on: "deals-damage", who: "self", to: "planeswalker", combat: true },
    targets: [],
    effect: { kind: "surveil", amount: 1 },
    resolve: null,
    text: DAMAGE_TEXT,
  },
];

export default defineCard({
  name: "Farseeing Flockmate",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\nFlying backup (When this creature enters the battlefield, put a flying counter on target creature. If that's another creature, it also gains the following ability until end of turn.)\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "target-is-source", index: 0 } },
            then: {
              kind: "sequence",
              effects: DAMAGE.map((ability) => ({
                kind: "grant-triggered" as const,
                target: 0,
                ability,
                duration: "end-of-turn" as const,
              })),
            },
          },
        ],
      },
      resolve: null,
      text: "Flying backup (When this creature enters the battlefield, put a flying counter on target creature. If that's another creature, it also gains the following ability until end of turn.)",
    },
    ...DAMAGE,
  ],
});
