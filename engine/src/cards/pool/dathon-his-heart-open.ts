import { defineCard } from "../define.js";

// EDHREC rank 28114.
// "If it's a Saga spell" reads the spell that was cast, as the trigger
// resolves (as it last existed, if it has left the stack).

const CAST_TEXT =
  "Whenever you cast an enchantment spell, draw a card. If it's a Saga spell, Dathon deals 2 damage to each opponent.";
const COUNTER_TEXT =
  "{2}: Choose a counter on target enchantment you control. Put another counter of that kind on it. Activate only as a sorcery.";

export default defineCard({
  name: "Dathon, His Heart Open",
  manaCost: "{G}{U}{R}",
  colors: ["G", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tamarian", "Officer"],
  power: 3,
  toughness: 3,
  text: `${CAST_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { subtype: "Saga" } },
            then: { kind: "damage", amount: 2, who: "each-opponent" },
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "enchantment" } }],
      effect: {
        kind: "choose-value",
        value: "counter-kind",
        on: 0,
        then: { kind: "add-counter", target: 0, counter: "$chosenCounter", amount: 1 },
      },
      resolve: null,
      sorcerySpeed: true,
      text: COUNTER_TEXT,
    },
  ],
});
