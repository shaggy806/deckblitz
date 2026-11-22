import { defineCard } from "../define.js";

// EDHREC rank 20609. "Can't have counters put on it" / "can't get counters"
// is a `get-counters` prohibition bound to that creature (in this stint, rule
// 400.7) or that player, lasting while Suncleanser stays on the battlefield
// (`"while-source"`): Solemnity's gate, so a cost putting counters there
// can't be paid, and infect or wither damage leaves nothing (the rulings).
const TEXT = "When this creature enters, choose one —";
const CREATURE_TEXT =
  "Remove all counters from target creature. It can't have counters put on it for as long as this creature remains on the battlefield.";
const PLAYER_TEXT =
  "Target opponent loses all counters. That player can't get counters for as long as this creature remains on the battlefield.";

export default defineCard({
  name: "Suncleanser",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 4,
  text: `${TEXT}\n• ${CREATURE_TEXT}\n• ${PLAYER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: CREATURE_TEXT,
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
                { kind: "prohibit", prohibits: [{ act: "get-counters", target: 0 }], duration: "while-source" },
              ],
            },
          },
          {
            text: PLAYER_TEXT,
            targets: ["opponent"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "remove-player-counters", counter: "every-kind", amount: "all", target: 0 },
                { kind: "prohibit", prohibits: [{ act: "get-counters", who: { target: 0 } }], duration: "while-source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `${TEXT}\n• ${CREATURE_TEXT}\n• ${PLAYER_TEXT}`,
    },
  ],
});
