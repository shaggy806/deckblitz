import { defineCard } from "../define.js";

// EDHREC rank 31646.

const I_TEXT = "I — Return target green or white creature card from your graveyard to the battlefield.";
const II_TEXT =
  "II — Choose target creature. Whenever it deals combat damage to a player this turn, you draw that many cards.";
const III_TEXT =
  "III — You gain life equal to the greatest power among creatures you control. Create a Treasure token.";

export default defineCard({
  name: "The Inner Light",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: ["creature"],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "deals-combat-damage-to-player", who: "self" }, watching: 0 },
        effect: { kind: "draw", amount: { triggerValue: true } },
        text: "Whenever that creature deals combat damage to a player this turn, you draw that many cards.",
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "gain-life",
            amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
          },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
