import { defineCard } from "../define.js";

// EDHREC rank 7029.
// The −2 is a delayed triggered ability for the rest of the turn (rule
// 603.7c) on the batched attack: it counts the nontoken attackers as they're
// declared (so one that leaves combat before it resolves still counts — the
// ruling), and attacking tokens neither fire it nor count. Each Soldier
// enters attacking a player or planeswalker of its controller's choice and
// was never declared as an attacker (the rulings).
const PLUS_TEXT = "+1: Put a +1/+1 counter on up to one target creature. It gains indestructible until end of turn.";
const MINUS_TEXT =
  "−2: Whenever one or more nontoken creatures attack this turn, create that many 1/1 white Soldier creature tokens that are tapped and attacking.";
const EMBLEM_TEXT =
  'At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.';
const ULT_TEXT = `−6: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Basri Ket",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Basri"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks-batch", who: "any", filter: { type: "creature", token: false } } },
        effect: {
          kind: "create-token",
          token: "Soldier Token",
          count: { triggerValue: true },
          tapped: true,
          attacking: "choose",
        },
        text: "Whenever one or more nontoken creatures attack this turn, create that many 1/1 white Soldier creature tokens that are tapped and attacking.",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "step-begins", step: "begin-combat", who: "you" },
            targets: [],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Soldier Token", count: 1 },
                {
                  kind: "add-counter-all",
                  filter: { type: "creature", controlledBy: "you" },
                  counter: "+1/+1",
                  amount: 1,
                },
              ],
            },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
