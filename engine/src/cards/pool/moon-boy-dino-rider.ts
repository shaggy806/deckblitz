import { defineCard } from "../define.js";

// EDHREC rank 23505.
//
// "While you control a Dinosaur" is part of the trigger condition: it
// triggers only if you control one as Moon-Boy is declared as an attacker
// (Ruby, Daring Tracker's `whileCondition`).
const COST_TEXT = "Dinosaur spells you cast cost {1} less to cast.";
const ATTACK_TEXT = "Whenever Moon-Boy attacks while you control a Dinosaur, Moon-Boy gets +1/+1 until end of turn.";

export default defineCard({
  name: "Moon-Boy, Dino Rider",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ape", "Human"],
  power: 2,
  toughness: 2,
  text: `${COST_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Dinosaur" }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
