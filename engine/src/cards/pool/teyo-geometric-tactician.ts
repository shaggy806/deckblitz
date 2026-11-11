import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 5122.
//
// Rulings:
//   Teyo, Geometric Tactician's last ability doesn't affect creatures that enter the battlefield
//     attacking.
//   If Teyo, Geometric Tactician's last ability and another similar effect disagree on which
//     direction three or more players may attack, players can't attack at all.
//   Teyo, Geometric Tactician's last ability affects only what players and planeswalkers each
//     player may attack.
//
// The direction is the mode chosen as the −2 resolves; the rule is the `attack-only-nearest`
// record over the game until your next turn. Left is onward in turn order, right is back
// (Pramikon's reading). Of two this Teyo made, the last chosen direction is the one in force.

const WALL_TEXT = "When Teyo enters, create a 0/4 white Wall creature token with defender and flying.";
const DRAW_TEXT = "+1: You and target opponent each draw a card.";
const DIRECTION_TEXT =
  "−2: Choose left or right. Until your next turn, each player may attack only the nearest opponent in the last chosen direction and planeswalkers controlled by that opponent.";

const direct = (direction: "left" | "right"): EffectSpec => ({
  kind: "restrict",
  filter: {},
  restrictions: [{ kind: "attack-only-nearest", direction }],
  duration: "until-your-next-turn",
});

export default defineCard({
  name: "Teyo, Geometric Tactician",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teyo"],
  loyalty: 3,
  text: `${WALL_TEXT}\n${DRAW_TEXT}\n${DIRECTION_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "draw", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Left — each player may attack only the next opponent in turn order and that opponent's planeswalkers",
            effect: direct("left"),
          },
          {
            text: "Right — each player may attack only the previous opponent in turn order and that opponent's planeswalkers",
            effect: direct("right"),
          },
        ],
      },
      resolve: null,
      text: DIRECTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wall Token (Teyo, Geometric Tactician)", count: 1 },
      resolve: null,
      text: WALL_TEXT,
    },
  ],
});
