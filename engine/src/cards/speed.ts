/**
 * The definition a player's speed ability object is read through (rule
 * 702.179d — `PlayerState.speedAbility`, made by `Game.setSpeed`): no
 * colours, no types, and the one inherent triggered ability a player with
 * speed has. Registered beside the pool, as the emblem's definition is; not
 * a card a deck can hold.
 *
 * "Whenever one or more opponents lose life during your turn" is a
 * `loses-life` trigger with "during your turn" as part of its trigger
 * condition (`whileCondition`, rule 603.1); "if your speed is less than 4"
 * an intervening if (603.4 — asked again as it resolves, so it never takes
 * speed past max); "this ability triggers only once each turn" `oncePerTurn`
 * (603.2), on the one object that carries it all game. One or more
 * opponents losing life at once triggers it once.
 */
import { defineCard } from "./define.js";
import type { CardDefinition } from "./define.js";
import { MAX_SPEED } from "../state.js";

/** The registry name of a player's speed ability object. */
export const SPEED_CARD = "Speed";

const SPEED_TEXT =
  "Whenever one or more opponents lose life during your turn, if your speed is less than 4, your speed increases by 1. This ability triggers only once each turn.";

export const SPEED_DEFINITIONS: readonly CardDefinition[] = [
  defineCard({
    name: SPEED_CARD,
    colors: [],
    types: [],
    // The Aetherdrift speed tracker (Start Your Engines! // Max Speed).
    art: "c287becf-fc36-4c58-9d53-7b5870174c7d",
    text: SPEED_TEXT,
    triggered: [
      {
        trigger: { on: "loses-life", who: "opponent" },
        whileCondition: { kind: "your-turn" },
        condition: { kind: "speed", atMost: MAX_SPEED - 1 },
        oncePerTurn: true,
        targets: [],
        effect: { kind: "increase-speed", amount: 1 },
        resolve: null,
        text: SPEED_TEXT,
      },
    ],
  }),
];
