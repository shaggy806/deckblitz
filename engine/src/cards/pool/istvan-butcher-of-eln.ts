import { defineCard } from "../define.js";

// Mystery Booster Commander.
const ATTACKS = "Istvan attacks each combat if able.";
const PREVENT = "Prevent all damage that would be dealt to Istvan by creatures.";
const DIES = "Whenever a creature an opponent controls dies, put two +1/+1 counters on Istvan.";

export default defineCard({
  name: "Istvan, Butcher of Eln",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 3,
  text: `${ATTACKS}\n${PREVENT}\n${DIES}`,
  static: [
    { affects: { scope: "self" }, restrictions: ["must-attack"], text: ATTACKS },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", instead: { prevent: true }, to: "self", source: { types: ["creature"] } },
      text: PREVENT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: DIES,
    },
  ],
});
