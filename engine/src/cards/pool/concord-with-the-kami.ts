import { defineCard } from "../define.js";

// EDHREC rank 13090.
// Makes Spirit → use "Spirit Token (Colorless)".
//
// Rulings:
//   [2022-02-18] You cannot choose the first mode unless you have a legal target for it. You may
//     choose the second and third mode even if you don't have an enchanted or equipped creature at
//     the time this ability triggers.
//   [2022-02-18] If you choose the first mode, and the target creature becomes an illegal target by
//     the time the ability tries to resolve, the ability won't resolve and none of its effects will
//     happen, even if you chose other modes.
//
// "Choose one or more" is announced as the ability goes on the stack (rule
// 700.2b). The second and third modes check their "if" as they resolve, so
// either may be chosen with nothing enchanted or equipped.
const TRIGGER_TEXT = "At the beginning of your end step, choose one or more —";
const MODE_COUNTER = "Put a +1/+1 counter on target creature with a counter on it.";
const MODE_DRAW = "Draw a card if you control an enchanted creature.";
const MODE_SPIRIT = "Create a 1/1 colorless Spirit creature token if you control an equipped creature.";

export default defineCard({
  name: "Concord with the Kami",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n• ${MODE_COUNTER}\n• ${MODE_DRAW}\n• ${MODE_SPIRIT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 3,
        modes: [
          {
            text: MODE_COUNTER,
            targets: [
              {
                kind: "permanent",
                whose: "any",
                filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
              },
            ],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: MODE_DRAW,
            effect: {
              kind: "conditional",
              condition: { kind: "controls", filter: { type: "creature", enchanted: true }, atLeast: 1 },
              then: { kind: "draw", amount: 1 },
            },
          },
          {
            text: MODE_SPIRIT,
            effect: {
              kind: "conditional",
              condition: { kind: "controls", filter: { type: "creature", equipped: true }, atLeast: 1 },
              then: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${MODE_COUNTER} ${MODE_DRAW} ${MODE_SPIRIT}`,
    },
  ],
});
