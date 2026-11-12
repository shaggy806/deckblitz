import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect); "this ability triggers only once" is ever, for this object
// (`triggersOnlyOnce`).
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";
const CONJURE_TEXT =
  "When you draw your third card in a turn, conjure a card named Mox Emerald into your hand. This ability triggers only once.";
const BIG_TEXT = "{2}{G}: This creature has base power and toughness 4/4 until end of turn.";

export default defineCard({
  name: "Emerald Collector",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
  toughness: 2,
  text: `${DAMAGE_TEXT}\n${CONJURE_TEXT}\n${BIG_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 3 },
      triggersOnlyOnce: true,
      targets: [],
      effect: { kind: "conjure", name: "Mox Emerald", to: "hand" },
      resolve: null,
      text: CONJURE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "become", target: "source", power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: BIG_TEXT,
    },
  ],
});
