import { defineCard } from "../define.js";

// EDHREC rank 18460.

const ENTER_TEXT = "When this creature enters, surveil 2.";

export default defineCard({
  name: "Starbreach Whale",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\nWarp {1}{U} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{1}{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
