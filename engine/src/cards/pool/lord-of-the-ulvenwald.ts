import { defineCard } from "../define.js";

// The nightbound back face of Kessig Naturalist.
const ANTHEM_TEXT = "Other Wolves and Werewolves you control get +1/+1.";
const ATTACK_TEXT =
  "Whenever this creature attacks, add {R} or {G}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Lord of the Ulvenwald",
  art: "https://cards.scryfall.io/art_crop/back/8/a/8ab5f2e6-0e0a-4f7d-a959-3d07948ff317.jpg",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["nightbound"],
  text: `${ANTHEM_TEXT}\n${ATTACK_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1, persists: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  faces: ["Kessig Naturalist", "Lord of the Ulvenwald"],
  transform: true,
});
