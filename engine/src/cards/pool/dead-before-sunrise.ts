import { defineCard } from "../define.js";

// EDHREC rank 12294.
//
// Both halves reach the outlaw creatures you control as it resolves (rule
// 611.2c). The granted ability's "this creature" is the creature, which deals
// the damage — as it last existed if it has left by then (the ruling).
const OUTLAW_CREATURES = {
  type: "creature",
  controlledBy: "you",
  subtypes: ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"],
} as const;
const GRANTED_TEXT = "{T}: This creature deals damage equal to its power to target creature.";
const TEXT = `Until end of turn, outlaw creatures you control get +1/+0 and gain "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Dead Before Sunrise",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TEXT} (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: OUTLAW_CREATURES, power: 1, toughness: 0, duration: "end-of-turn" },
      {
        kind: "grant-activated-all",
        filter: OUTLAW_CREATURES,
        ability: {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
    ],
  },
});
