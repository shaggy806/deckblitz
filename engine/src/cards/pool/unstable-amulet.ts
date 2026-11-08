import { defineCard } from "../define.js";

// Ruling: if the artifact leaves, the most recent card stays playable for as
// long as it remains exiled.

const ETB_TEXT = "When this artifact enters, you get {E}{E} (two energy counters).";
const CAST_TEXT = "Whenever you cast a spell from anywhere other than your hand, this artifact deals 1 damage to each opponent.";
const EXILE_TEXT = "{T}, Pay {E}{E}: Exile the top card of your library. You may play it until you exile another card with this artifact.";

export default defineCard({
  name: "Unstable Amulet",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${ETB_TEXT}\n${CAST_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 2 },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "until-next-exile", play: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
