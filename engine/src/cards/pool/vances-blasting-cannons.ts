import { defineCard } from "../define.js";

// EDHREC rank 15066. "If it's a nonland card, you may cast that card this
// turn" is a cast-only permission (`castOnly`): a land can't be cast, so an
// exiled land just stays in exile, as does a card you don't cast (the ruling).
// Casting it follows its normal timing and costs (the ruling). The third-spell
// trigger counts every spell you cast this turn, this one included (the ruling).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile the top card of your library. If it's a nonland card, you may cast that card this turn.";
const THIRD_TEXT = "Whenever you cast your third spell in a turn, you may transform Vance's Blasting Cannons.";

export default defineCard({
  name: "Vance's Blasting Cannons",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${THIRD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", castOnly: true },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 3 },
      targets: [],
      effect: { kind: "may", prompt: "Transform Vance's Blasting Cannons?", effect: { kind: "transform", target: "source" } },
      resolve: null,
      text: THIRD_TEXT,
    },
  ],
  faces: ["Vance's Blasting Cannons", "Spitfire Bastion"],
  transform: true,
});
