import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const CONSTELLATION_TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, you gain 1 life.";
const DRAIN_TEXT = "{W}{B}, Pay 1 life: Each opponent loses 1 life.";

export default defineCard({
  name: "Underworld Coinsmith",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${CONSTELLATION_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: CONSTELLATION_TEXT,
    }),
  ],
  activated: [
    {
      cost: { mana: "{W}{B}", tap: false, payLife: 1 },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
