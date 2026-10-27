import { defineCard } from "../define.js";

const TEXT = "Whenever a creature or enchantment you control enters this turn, draw a card.";

export default defineCard({
  name: "Rite of Harmony",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  flashback: { cost: "{2}{G}{W}" },
  text: `${TEXT}\nFlashback {2}{G}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: {
      whenever: { on: "enters-battlefield", who: "you-control", filter: { typesAnyOf: ["creature", "enchantment"] } },
    },
    effect: { kind: "draw", amount: 1 },
    text: TEXT,
  },
});
