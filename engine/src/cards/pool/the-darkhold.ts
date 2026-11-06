import { defineCard } from "../define.js";

// Marvel: Darkhold Destiny (preview). The draw counts the sin counters on it
// once the new one is on (the counter first, in the order printed), and the
// life loss reads the hand after that draw.
const SIN = "{T}: Put a sin counter on The Darkhold. Draw a card for each sin counter on it, then you lose 1 life for each card in your hand.";
const LOWEST =
  "{6}{B}{B}, {T}: Each player's life total becomes the lowest life total among all players. Activate only as a sorcery.";

export default defineCard({
  name: "The Darkhold",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${SIN}\n${LOWEST}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "sin", amount: 1 },
          { kind: "draw", amount: { countersOn: "source", counter: "sin" } },
          { kind: "lose-life", amount: { cardsInHand: "you" } },
        ],
      },
      resolve: null,
      text: SIN,
    },
    {
      cost: { mana: "{6}{B}{B}", tap: true },
      targets: [],
      effect: { kind: "set-life-total", who: "each-player", amount: { lowestLifeTotal: true } },
      resolve: null,
      sorcerySpeed: true,
      text: LOWEST,
    },
  ],
});
