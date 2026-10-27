import { defineCard } from "../define.js";

// EDHREC rank 10327.

const TEXT = "{1}{G}, Exile two cards from your graveyard: Create a 2/2 green Bear creature token.";

export default defineCard({
  name: "Bearscape",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, exileFromGraveyard: { count: 2 } },
      targets: [],
      effect: { kind: "create-token", token: "Bear Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
