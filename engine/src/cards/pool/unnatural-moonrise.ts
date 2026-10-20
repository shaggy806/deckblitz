import { defineCard } from "../define.js";

const GRANTED_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Unnatural Moonrise",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  flashback: { cost: "{2}{R}{G}" },
  text: `It becomes night. Until end of turn, target creature gets +1/+0 and gains trample and "${GRANTED_TEXT}"\nFlashback {2}{R}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "day-night", value: "night" },
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      },
    ],
  },
});
