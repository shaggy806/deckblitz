import { defineCard } from "../define.js";

// EDHREC rank 5700. "Becomes a 4/4 red Dragon creature" with no "in addition":
// each planeswalker stops being one until end of turn, keeping its counters and
// abilities (the rulings — Sarkhan, the Dragonspeaker's shape, over all of them).

const ATTACK_TEXT = "Whenever a creature attacks you or a planeswalker you control, each Dragon you control deals 1 damage to that creature.";

export default defineCard({
  name: "Sarkhan the Masterless",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sarkhan"],
  loyalty: 5,
  text: `${ATTACK_TEXT}\n+1: Until end of turn, each planeswalker you control becomes a 4/4 red Dragon creature and gains flying.\n−3: Create a 4/4 red Dragon creature token with flying.`,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      targets: [],
      effect: { kind: "each-deals-damage", filter: { subtype: "Dragon", controlledBy: "you" }, amount: 1, to: "trigger-object" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "planeswalker", controlledBy: "you" },
        as: 0,
        effect: {
          kind: "animate",
          target: 0,
          power: 4,
          toughness: 4,
          addTypes: [],
          setTypes: ["creature"],
          addSubtypes: [],
          setSubtypes: ["Dragon"],
          setColors: ["R"],
          keywords: ["flying"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: "+1: Until end of turn, each planeswalker you control becomes a 4/4 red Dragon creature and gains flying.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 1 },
      resolve: null,
      text: "−3: Create a 4/4 red Dragon creature token with flying.",
    },
  ],
});
