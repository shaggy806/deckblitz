import { defineCard } from "../define.js";
import { SIEGE_REMINDER, distinctTargets, siege } from "../helpers.js";

// EDHREC rank 8411.

const ENTER_TEXT =
  "When this Siege enters, return up to three target permanent cards from your graveyard to your hand.";

const PERMANENT_CARD = {
  typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
} as const;

export default defineCard({
  name: "Invasion of Shandalar",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(3, { kind: "card-in-graveyard", whose: "you", filter: PERMANENT_CARD }, { optional: true }),
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
          { kind: "return-to-hand", target: 2, from: "graveyard" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Shandalar", "Leyline Surge"],
  transform: true,
});
