import { defineCard } from "../define.js";

// EDHREC rank 6178.
//
// "Had to attack" is the attack's journal entry: whether the creature itself
// was under a requirement to attack as it was declared (rule 508.1d — goad,
// "attacks each combat if able"), not one on its controller (the ruling's
// Trove of Temptation). Asked as the trigger triggers and as it resolves
// (603.4), of the creature as it last existed if it has left.

const GOAD_TEXT = "Whenever one or more Dragons you control attack an opponent, goad target creature that player controls.";
const DAMAGE_TEXT =
  "Whenever a creature deals combat damage to one of your opponents, if that creature had to attack this combat, you put a +1/+1 counter on Firkraag and you draw a card.";

export default defineCard({
  name: "Firkraag, Cunning Instigator",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${GOAD_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "opponent", filter: { subtype: "Dragon" } },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "goad", target: 0 },
      resolve: null,
      text: GOAD_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { type: "creature" }, toOpponent: true },
      condition: { kind: "trigger-object", filter: { journaled: { what: "had-to-attack", thisCombat: true } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
