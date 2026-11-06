import { defineCard } from "../define.js";

// Mystery Booster Commander. A shadow counter is a keyword counter (rule
// 122.1b): the creature has shadow while it's on.
const DRAW = "Whenever a creature you control with shadow deals combat damage to a player, draw a card.";
const COUNTER = "{3}: Put a shadow counter on another target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Lyna, Veil of Vengeance",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Soltari", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${DRAW}\n${COUNTER}`,
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", keyword: "shadow" },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "shadow", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: COUNTER,
    },
  ],
});
