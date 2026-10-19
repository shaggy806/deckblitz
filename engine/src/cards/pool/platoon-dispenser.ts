import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 10617.
//
// Rulings:
//   [2022-10-14] You must control two or more other creatures both when the first ability
//     triggers and when it resolves. If you control fewer than two other creatures at either
//     time, you won't draw a card.
//
// An intervening-if (rule 603.4 — checked as it triggers and as it resolves,
// the ruling), Flight-Deck Coordinator's shape, leaving this creature out of
// the count (`excludeSelf`).

const END_TEXT = "At the beginning of your end step, if you control two or more other creatures, draw a card.";
const TOKEN_TEXT = "{3}{W}: Create a 1/1 colorless Soldier artifact creature token.";

export default defineCard({
  name: "Platoon Dispenser",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 6,
  text: `${END_TEXT}\n${TOKEN_TEXT}\nUnearth {2}{W}{W}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 2, excludeSelf: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Artifact Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    unearth("{2}{W}{W}"),
  ],
});
