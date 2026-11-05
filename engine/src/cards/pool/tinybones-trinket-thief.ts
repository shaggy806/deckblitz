import { defineCard } from "../define.js";

const END =
  "At the beginning of each end step, if an opponent discarded a card this turn, you draw a card and you lose 1 life.";
const DRAIN = "{4}{B}{B}: Each opponent with no cards in hand loses 10 life.";

export default defineCard({
  name: "Tinybones, Trinket Thief",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skeleton", "Rogue"],
  power: 1,
  toughness: 2,
  text: `${END}\n${DRAIN}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "discarded", who: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: END,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{B}{B}", tap: false },
      targets: [],
      // Hands are checked as it resolves (the ruling).
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        whoIf: { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atMost: 0 } },
        effect: { kind: "lose-life", amount: 10, who: "that-player" },
      },
      resolve: null,
      text: DRAIN,
    },
  ],
});
