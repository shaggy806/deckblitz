import { defineCard } from "../define.js";

// EDHREC rank 15410. Fallen Empires.
// The life is counted off the creature as it was sacrificed (`"sacrificed"`'s
// last-known information — rule 608.2h).

const ENTERS = "This creature enters with three credit counters on it.";
const DAMAGE = "When this creature enters, it deals 3 damage to you.";
const UPKEEP = "At the beginning of your upkeep, put a credit counter on this creature.";
const SAC = "Sacrifice this creature: You gain 1 life for each credit counter on this creature. Activate only during your upkeep.";

export default defineCard({
  name: "Icatian Moneychanger",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 2,
  text: `${ENTERS}\n${DAMAGE}\n${UPKEEP}\n${SAC}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "gain-life", amount: { countersOn: "sacrificed", counter: "credit" } },
      resolve: null,
      text: SAC,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "you" },
      resolve: null,
      text: DAMAGE,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "credit", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "credit", amount: 3 } },
      text: ENTERS,
    },
  ],
});
