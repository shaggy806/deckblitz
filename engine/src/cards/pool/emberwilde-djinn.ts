import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 29246.

const TEXT =
  "At the beginning of each player's upkeep, that player may pay {R}{R} or 2 life. If the player does, they gain control of this creature.";

export default defineCard({
  name: "Emberwilde Djinn",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Pay {R}{R} or 2 life to gain control of Emberwilde Djinn?",
        options: [
          { pay: "{R}{R}", text: "Pay {R}{R}" },
          { payLife: 2, text: "Pay 2 life" },
        ],
        ifDid: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
