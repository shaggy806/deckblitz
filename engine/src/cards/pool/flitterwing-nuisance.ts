import { defineCard } from "../define.js";

// EDHREC rank 8455.
//
// "Remove a counter from this creature": of any kind on it. The delayed
// ability lasts this turn; combat damage to a player and to a planeswalker
// are two trigger events, so it's written as two watches — no creature deals
// combat damage to both a player and a planeswalker in one damage step here.

const DRAW_TEXT =
  "Whenever a creature you control deals combat damage to a player or planeswalker this turn, draw a card.";

export default defineCard({
  name: "Flitterwing Nuisance",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\nThis creature enters with a -1/-1 counter on it.\n{2}{U}, Remove a counter from this creature: ${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, removeCounter: { kind: "any", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } } },
            effect: { kind: "draw", amount: 1 },
            text: DRAW_TEXT,
          },
          {
            kind: "delayed-trigger",
            at: {
              whenever: {
                on: "deals-damage",
                who: "you-control",
                filter: { type: "creature" },
                combat: true,
                to: "planeswalker",
              },
            },
            effect: { kind: "draw", amount: 1 },
            text: DRAW_TEXT,
          },
        ],
      },
      resolve: null,
      text: `{2}{U}, Remove a counter from this creature: ${DRAW_TEXT}`,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 1 } },
      text: "This creature enters with a -1/-1 counter on it.",
    },
  ],
});
