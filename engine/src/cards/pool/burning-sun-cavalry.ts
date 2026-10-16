import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. "Attacks or blocks" is two trigger events of
// one ability (Merfolk Skyscout's pair, `sameAbilityAs`); "while you
// control a Dinosaur" is part of the trigger condition (rule 603.1), so a
// Dinosaur gone by the time it resolves doesn't matter (the ruling) —
// Moon-Boy, Dino Rider's `whileCondition`.

const TEXT =
  "Whenever this creature attacks or blocks while you control a Dinosaur, this creature gets +1/+1 until end of turn.";

const WHILE = { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 } as const;
const PUMP = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Burning Sun Cavalry",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: WHILE,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      sameAbilityAs: 0,
      whileCondition: WHILE,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
