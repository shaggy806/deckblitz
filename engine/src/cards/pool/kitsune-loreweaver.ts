import { defineCard } from "../define.js";

// EDHREC rank 26520. X is counted as the ability resolves and stays fixed
// for the turn.
const TEXT = "{1}{W}: This creature gets +0/+X until end of turn, where X is the number of cards in your hand.";

export default defineCard({
  name: "Kitsune Loreweaver",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: 0,
        toughness: { cardsInHand: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
