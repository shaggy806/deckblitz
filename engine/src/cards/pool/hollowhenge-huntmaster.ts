import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "Other permanents you control have hexproof.";
const COMBAT_TEXT = "At the beginning of combat on your turn, put two +1/+1 counters on each creature you control.";

export default defineCard({
  name: "Hollowhenge Huntmaster",
  art: "https://cards.scryfall.io/art_crop/back/c/0/c0c358b4-5af2-438f-8bd5-beb0ee6b518b.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 6,
  keywords: ["hexproof", "nightbound"],
  text: `Hexproof\n${HEXPROOF_TEXT}\n${COMBAT_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you" }, excludeSelf: true },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 2,
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  faces: ["Avabruck Caretaker", "Hollowhenge Huntmaster"],
  transform: true,
});
