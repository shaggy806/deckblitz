import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The right door of Walk-In Closet // Forgotten Cellar — Gaea's Will's two
// turn-long effects, spells only.
const UNLOCK =
  "When you unlock this door, you may cast spells from your graveyard this turn, and if a card would be put into your graveyard from anywhere this turn, exile it instead.";
const FACES = ["Walk-In Closet // Forgotten Cellar", "Walk-In Closet", "Forgotten Cellar"];

export default defineCard({
  name: "Forgotten Cellar",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("right"),
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "graveyard", filter: {} } },
          { kind: "player-effect", duration: "end-of-turn", graveyardExile: { filter: { ownedBy: "you", token: false } } },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: FACES,
  split: true,
});
