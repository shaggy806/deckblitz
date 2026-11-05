import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, choose target opponent. If they lost life this turn, they reveal their hand, you choose a nonland card from it, and they discard that card. Otherwise, they discard a card.";

export default defineCard({
  name: "Thought-Stalker Warlock",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lizard", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "conditional",
        condition: {
          kind: "of-player",
          player: { target: 0 },
          condition: { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 1 },
        },
        then: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
        else: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
