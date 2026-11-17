import { defineCard } from "../define.js";

// Strixhaven (STX). The front face of Flamescroll Celebrant // Revel in Silence (a modal
// double-faced card).
//
// Rulings:
//   [2021-04-16] An activated ability that costs mana to activate is not a "mana ability" unless
//     it could also produce mana and has no targets.
//   [2021-04-16] Loyalty abilities of planeswalkers are also activated abilities.
//
// `activates-ability` never sees a mana ability (rule 605.3b), and unnarrowed it sees every
// ability that uses the stack, from any zone — loyalty abilities, equip and cycling included
// (Burning-Tree Shaman's shape, an opponent's alone).

const TRIGGER_TEXT =
  "Whenever an opponent activates an ability that isn't a mana ability, this creature deals 1 damage to that player.";
const PUMP_TEXT = "{1}{R}: This creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Flamescroll Celebrant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 1,
  text: `${TRIGGER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "opponent" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  faces: ["Flamescroll Celebrant", "Revel in Silence"],
});
