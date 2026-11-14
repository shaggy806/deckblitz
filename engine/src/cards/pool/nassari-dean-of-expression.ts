import { defineCard } from "../define.js";

// Uvilda, Dean of Perfection's back face.
//
// - The upkeep trigger is Stolen Strategy's, word for word: face up, normal
//   timing (the ruling), the cards not cast staying exiled for good.
// - The counter trigger is Kami of Celebration's: any spell cast from exile,
//   not just these (the ruling).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile the top card of each opponent's library. Until end of turn, you may cast spells from among those exiled cards, and you may spend mana as though it were mana of any color to cast those spells.";
const COUNTER_TEXT = "Whenever you cast a spell from exile, put a +1/+1 counter on Nassari.";

export default defineCard({
  name: "Nassari, Dean of Expression",
  art: "https://cards.scryfall.io/art_crop/back/8/c/8cfd0887-0c83-4b33-a85e-8b8ec5bf758d.jpg",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Efreet", "Shaman"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, whose: "each-opponent", duration: "end-of-turn", spendAs: "any-color" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", from: "exile" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  faces: ["Uvilda, Dean of Perfection", "Nassari, Dean of Expression"],
});
