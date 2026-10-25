import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 32031.
//
// "If you control an Island" is an intervening if (rule 603.4): checked as
// it triggers and again as it resolves.
const TEXT = "Whenever this creature deals combat damage to a player, if you control an Island, you may draw a card.";

export default defineCard({
  name: "Shoreline Salvager",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Surrakar"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
