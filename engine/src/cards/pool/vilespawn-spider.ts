import { defineCard } from "../define.js";

// The Spider is sacrificed as a cost, so it's in the graveyard when the
// count is read on resolution and counts itself.
const UPKEEP_TEXT = "At the beginning of your upkeep, mill a card.";
const SAC_TEXT =
  "{2}{G}{U}, {T}, Sacrifice this creature: Create a 1/1 green Insect creature token for each creature card in your graveyard. Activate only as a sorcery.";

export default defineCard({
  name: "Vilespawn Spider",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${UPKEEP_TEXT} (Put the top card of your library into your graveyard.)\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}{U}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Insect Token",
        count: { countInGraveyard: { type: "creature", ownedBy: "you" } },
      },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
