import { defineCard } from "../define.js";

// Throne of Eldraine. EDHREC rank 14688.
// One long intervening "if" (rule 603.4, the ruling): all three hold as your
// upkeep begins or it doesn't trigger, and again as it resolves or you don't
// win. Five colors among your permanents, however spread (lands are normally
// colorless); six card types among your permanents (as they are now) and
// your graveyard's cards (printed, an adventurer's alone), each type once —
// supertypes aren't card types.

const ENTERS_TEXT = "When this enchantment enters, each player gains 5 life and draws a card.";
const WIN_TEXT =
  "At the beginning of your upkeep, if there are five colors among permanents you control, there are six or more card types among permanents you control and/or cards in your graveyard, and your life total is greater than or equal to your starting life total, you win the game.";

export default defineCard({
  name: "Happily Ever After",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${WIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 5, who: "each-player" },
          { kind: "draw", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          {
            kind: "aggregate",
            value: { aggregate: "distinct", of: "color", filter: { controlledBy: "you" } },
            compare: { op: "gte", n: 5 },
          },
          {
            kind: "aggregate",
            value: {
              aggregate: "distinct",
              of: "card-type",
              filter: { controlledBy: "you" },
              plus: [{ filter: { ownedBy: "you" }, in: "graveyards" }],
            },
            compare: { op: "gte", n: 6 },
          },
          { kind: "life-total", atLeast: { startingPlus: 0 } },
        ],
      },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: WIN_TEXT,
    },
  ],
});
