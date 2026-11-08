import { defineCard } from "../define.js";

// EDHREC rank 3869. "Each player who owns a spell you cast this way loses life
// equal to its mana value" reads the spells cast off the `cast-now` by their
// owners (`byOwner`): each player loses the total mana value of the spells
// they own, read on the stack, where a free spell's {X} is 0 (rule 107.3b).
//
// Rulings:
//   [2025-06-06] You choose which spells to cast (if any) as Kefka's last ability resolves. You
//     can't wait to cast them later in the turn. Timing restrictions based on their types are ignored.
//   [2025-06-06] Cards you choose not to cast this way (or can't cast this way) remain in exile.
//   [2025-06-06] If a spell you cast has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.

const INDESTRUCTIBLE_TEXT = "During your turn, Kefka has indestructible.";
const END_STEP_TEXT =
  "At the beginning of your end step, exile a card at random from each opponent's graveyard. You may cast any number of spells from among cards exiled this way without paying their mana costs. Then each player who owns a spell you cast this way loses life equal to its mana value.";

export default defineCard({
  name: "Kefka, Dancing Mad",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 6,
  toughness: 6,
  text: `${INDESTRUCTIBLE_TEXT}\n${END_STEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "choose-random-card",
              zone: "graveyard",
              whose: "that-player",
              then: { kind: "exile", target: 0 },
            },
          },
          { kind: "cast-now", from: "exiled-this-way", repeat: true, free: true },
          {
            kind: "lose-life",
            who: "each-player",
            amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "cast", who: "each", byOwner: true } },
          },
        ],
      },
      resolve: null,
      text: END_STEP_TEXT,
    },
  ],
});
