import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 15610.
//
// Rulings:
//   [2012-10-01] If Izzet Keyrune becomes a creature in a way other than its own activated
//     ability, its last ability will still work.
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.
//
// Dimir Keyrune's animation, and Abomination of Gudul's optional loot.
const ANIMATE_TEXT = "{U}{R}: Until end of turn, this artifact becomes a 2/1 blue and red Elemental artifact creature.";
const LOOT_TEXT =
  "Whenever this artifact deals combat damage to a player, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Izzet Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {U} or {R}.\n${ANIMATE_TEXT}\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U} or {R}.",
    },
    {
      cost: { mana: "{U}{R}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 1,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Elemental"],
        setColors: ["U", "R"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
