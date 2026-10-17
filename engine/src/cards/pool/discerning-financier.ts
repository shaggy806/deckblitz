import { defineCard } from "../define.js";

// EDHREC rank 7638.
//
// Rulings:
//   [2023-09-01] If the target Treasure is an illegal target as Discerning Financier's last
//     ability tries to resolve, it won't resolve. You won't draw a card.
//
// "Choose another player" isn't a target: chosen as the ability resolves
// (`choose-opponent` — in a free-for-all every other player is an opponent).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if an opponent controls more lands than you, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";
const GIVE_TEXT =
  "{2}{W}: Choose another player. That player gains control of target Treasure you control. You draw a card.";

export default defineCard({
  name: "Discerning Financier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 3,
  text: `${UPKEEP_TEXT}\n${GIVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", subtype: "Treasure" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-opponent",
            then: { kind: "gain-control", target: 0, who: "that-player", untilEndOfTurn: false },
          },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: GIVE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "opponent-controls-more", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
