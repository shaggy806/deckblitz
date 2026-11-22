import { defineCard } from "../define.js";

// EDHREC rank 19797.
//
// Rulings:
//   If there are two Bomb Squads on the battlefield when a creature ends up
//     with 4 or more fuse counters, both abilities trigger, causing 4 damage
//     each even though the first to resolve destroys the creature.
//   If the creature regenerates, the fuse counters are still removed and the
//     four damage is still dealt.
//
// The last ability is a state trigger (rule 603.8) about each creature on its
// own (`each`): it triggers for a creature as soon as it has four or more
// fuse counters, and not again for that creature while that instance waits
// or is on the stack. "That creature deals 4 damage to its controller" reads
// it as it last existed once it has been destroyed (rule 608.2h) — its
// controller then, its lifelink and deathtouch — so a regenerated or
// indestructible one deals it as well.
const TAP_TEXT = "{T}: Put a fuse counter on target creature.";
const UPKEEP_TEXT = "At the beginning of your upkeep, put a fuse counter on each creature with a fuse counter on it.";
const STATE_TEXT =
  "Whenever a creature has four or more fuse counters on it, remove all fuse counters from it and destroy it. That creature deals 4 damage to its controller.";

export default defineCard({
  name: "Bomb Squad",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: `${TAP_TEXT}\n${UPKEEP_TEXT}\n${STATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "fuse", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", counters: { kind: "fuse", compare: { op: "gte", n: 1 } } },
        counter: "fuse",
        amount: 1,
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: {
        on: "state",
        each: { type: "creature", counters: { kind: "fuse", compare: { op: "gte", n: 4 } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "trigger-object", counter: "fuse", amount: "all" },
          { kind: "destroy", target: "trigger-object" },
          { kind: "damage", amount: 4, from: "trigger-object", who: { controllerOf: "trigger-object" } },
        ],
      },
      resolve: null,
      text: STATE_TEXT,
    },
  ],
});
