import { defineCard } from "../define.js";

const PARLEY_TEXT =
  "Parley — Whenever this creature attacks, each player reveals the top card of their library. For each nonland card revealed this way, you investigate. Then each player draws a card.";
const END_TEXT =
  "At the beginning of your end step, you may untap all lands you control. If you do, you can't cast spells until your next turn.";

export default defineCard({
  name: "Innocuous Researcher",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Detective"],
  power: 3,
  toughness: 4,
  text: `${PARLEY_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-top",
        who: "each-player",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "create-token",
              token: "Clue Token",
              count: { thisWay: "revealed", filter: { notTypes: ["land"] } },
            },
            { kind: "draw", amount: 1, who: "each-player" },
          ],
        },
      },
      resolve: null,
      text: PARLEY_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap all lands you control? If you do, you can't cast spells until your next turn.",
        effect: { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
        then: { kind: "prohibit", prohibits: [{ act: "cast", who: "you" }], duration: "until-your-next-turn" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
