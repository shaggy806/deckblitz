import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, investigate once for each opponent who has more cards in hand than you. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Wojek Investigator",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Detective"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      resolve: null,
      effect: {
        kind: "create-token",
        token: "Clue Token",
        count: {
          countPlayers: "each-opponent",
          where: { kind: "player-compare", stat: "hand", compare: "fewer", than: "that-player" },
        },
      },
      text: TEXT,
    },
  ],
});
