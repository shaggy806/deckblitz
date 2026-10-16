/**
 * The definition a player's rad-counter ability object is read through (rule
 * 728.1 — `PlayerState.radAbility`, made by `Game.changePlayerCounters` the
 * first time they get a rad counter): no colours, no types, and the one
 * inherent triggered ability rad counters bring. Registered beside the pool,
 * as speed's is; not a card a deck can hold.
 *
 * "At the beginning of each player's precombat main phase, if that player has
 * one or more rad counters, that player mills a number of cards equal to the
 * number of rad counters they have. For each nonland card milled this way,
 * that player loses 1 life and removes one rad counter from themselves." Each
 * player's object triggers on their own precombat main, so its controller is
 * the active player, as the rule says; the "if" is an intervening if (603.4),
 * asked again as it resolves. The life lost is life lost "from radiation"
 * (728.1a).
 */
import { defineCard } from "./define.js";
import type { CardDefinition } from "./define.js";

/** The registry name of a player's rad-counter ability object. */
export const RAD_CARD = "Rad Counters";

const RAD_TEXT =
  "At the beginning of your precombat main phase, if you have one or more rad counters, mill a number of cards equal to the number of rad counters you have. For each nonland card milled this way, you lose 1 life and remove one rad counter from yourself.";

const NONLAND_MILLED = { thisWay: "milled", who: "you", filter: { notTypes: ["land"] } } as const;

export const RAD_DEFINITIONS: readonly CardDefinition[] = [
  defineCard({
    name: RAD_CARD,
    colors: [],
    types: [],
    // Nuclear Fallout's art (Fallout, PIP) — a printing in the Oracle snapshot.
    art: "e717e4b0-a8c1-4411-b18a-1d17e7225503",
    text: RAD_TEXT,
    triggered: [
      {
        trigger: { on: "step-begins", step: "precombat-main", who: "you" },
        condition: { kind: "player-counters", counter: "rad", who: "you", atLeast: 1 },
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: "you", amount: { playerCounters: "rad", who: "you" } },
            { kind: "lose-life", amount: NONLAND_MILLED },
            { kind: "remove-player-counters", counter: "rad", amount: NONLAND_MILLED },
          ],
        },
        resolve: null,
        text: RAD_TEXT,
      },
    ],
  }),
];
