import { defineCard } from "../define.js";

// Aetherdrift (DFT). EDHREC rank 11721.
//
// Rulings:
//   [2025-02-07] To double Overclocked Electromancer's power, it gets +X/+0, where X is its power
//     when its second ability resolves.
//   [2025-02-07] Some triggered abilities state that you "may pay" a certain amount of {E}. You
//     can't pay that amount multiple times to multiply the effect. You simply choose whether or
//     not to pay that amount of {E} as the ability resolves.
//   [2025-02-07] Excess damage has been dealt to a creature if the damage dealt to it is greater
//     than lethal damage. Usually, this means damage greater than its toughness, although damage
//     already marked on the creature is taken into account.
//
// The last ability's "if" (rule 603.4) is asked of the creature as the damage is dealt
// (`excessDamageThisTurn`, Maarika's shape); it can't stop being true before the ability
// resolves, the excess being already dealt this turn. "That excess damage" is the excess
// damage that creature was dealt this turn — the journal's excess for it in that stint, from
// every source (rule 120.10: sources dealing damage at once share what they dealt together past
// lethal damage), read as the ability resolves, though the creature has died since.

const COUNTER_TEXT =
  "At the beginning of combat on your turn, you may pay {E}{E}{E}. If you do, put a +1/+1 counter on this creature.";
const DOUBLE_TEXT = "Whenever this creature attacks, double its power until end of turn.";
const EXCESS_TEXT =
  "Whenever this creature deals combat damage to a creature, if that creature was dealt excess damage this turn, you get X {E}, where X is that excess damage.";

export default defineCard({
  name: "Overclocked Electromancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${COUNTER_TEXT}\n${DOUBLE_TEXT}\n${EXCESS_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E}{E} to put a +1/+1 counter on this creature?",
        costEnergy: 3,
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source", doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: DOUBLE_TEXT,
    },
    {
      trigger: {
        on: "deals-damage",
        who: "self",
        to: "creature",
        combat: true,
        toFilter: { excessDamageThisTurn: true },
      },
      targets: [],
      effect: {
        kind: "get-energy",
        amount: { damageDealtThisTurn: true, who: "each-player", to: "trigger-recipient", excess: true },
      },
      resolve: null,
      text: EXCESS_TEXT,
    },
  ],
});
