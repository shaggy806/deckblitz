import { defineCard } from "../define.js";

const EVASION = "The Balrog can't be blocked except by legendary creatures.";
const DIES = "When The Balrog dies, destroy target artifact or creature an opponent controls.";

export default defineCard({
  name: "The Balrog, Durin's Bane",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Demon"],
  power: 7,
  toughness: 5,
  keywords: ["haste"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnHistory: "sacrificed", who: "each-player" },
  },
  text: `This spell costs {1} less to cast for each permanent sacrificed this turn.\nHaste\n${EVASION}\n${DIES}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { notSupertype: "legendary" }, text: EVASION }],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DIES,
    },
  ],
});
