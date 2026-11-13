import { defineCard } from "../define.js";

// EDHREC rank 21435. Odyssey. The flashback's "Exile X blue cards" announces
// an X for that cast though its mana has none (Summons of Saruman's shape),
// which the look reads.
export default defineCard({
  name: "Flash of Insight",
  manaCost: "{X}{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at the top X cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.\nFlashback—{1}{U}, Exile X blue cards from your graveyard. (You may cast this card from your graveyard for its flashback cost, then exile it. You can't exile Flash of Insight to pay for its own flashback cost.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: "x",
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-any-order",
  },
  flashback: { cost: "{1}{U}", exileFromGraveyard: { count: "x", filter: { colors: ["U"] } } },
});
