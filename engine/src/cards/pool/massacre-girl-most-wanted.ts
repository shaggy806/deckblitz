import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 21274.
//
// "Whenever an opponent is dealt noncombat damage" is the batched damage
// trigger: once per opponent per simultaneous damage event, whatever dealt
// it — an opponent's own source too (Master of Barbs' shape, once per player
// rather than once per event).

const DIES_TEXT =
  "Whenever another creature or planeswalker you control dies, Massacre Girl deals 1 damage to target opponent and you gain 1 life.";
const GROW_TEXT = "Whenever an opponent is dealt noncombat damage, put a +1/+1 counter on Massacre Girl.";

export default defineCard({
  name: "Massacre Girl, Most Wanted",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 4,
  text: `${DIES_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        otherOnly: true,
      },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "opponent", combat: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
