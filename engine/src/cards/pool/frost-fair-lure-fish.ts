import { defineCard } from "../define.js";

// EDHREC rank 20904.
//
// Rulings:
//   [2023-10-13] Casting a foretold card from exile follows the timing rules for that card. If you
//     foretell an instant card, you can cast it as soon as the next player's turn. In most cases,
//     if you foretell a card that isn't an instant (like Frost Fair Lure Fish), you'll have to
//     wait until your next turn to cast it.
//   [2023-10-13] Because exiling a card with foretell from your hand is a special action, you can
//     do so any time you have priority during your turn, including in response to spells and
//     abilities.
//
// "Fish you control" are the permanents with the type, this one included (The
// Swarmweaver's `scope: "filter"`); each gets haste and Juggernaut's
// `cantBeBlockedBy`, here Humans.
const ENTER_TEXT =
  "When this creature enters, create two 1/1 blue Fish creature tokens and create two tapped Treasure tokens.";
const FISH_TEXT = "Fish you control have haste and can't be blocked by Humans.";
const FISH = { scope: "filter", filter: { subtype: "Fish", controlledBy: "you" } } as const;

export default defineCard({
  name: "Frost Fair Lure Fish",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 7,
  toughness: 7,
  foretell: { cost: "{3}{U}{R}" },
  text: `${ENTER_TEXT}\n${FISH_TEXT}\nForetell {3}{U}{R}`,
  static: [
    { affects: FISH, grantKeywords: ["haste"], text: FISH_TEXT },
    { affects: FISH, cantBeBlockedBy: { subtype: "Human" }, text: FISH_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Fish Token", count: 2 },
          { kind: "create-token", token: "Treasure Token", count: 2, tapped: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
