import { defineCard } from "../define.js";

const COST_TEXT = "Villain spells you cast cost {1} less to cast.";
const CONNIVE_TEXT =
  "Whenever another Villain you control enters, you may have it connive. Do this only once each turn.";

// Goblin Warchief's cost reduction; The Sensational She-Hulk's "do this only
// once each turn" (a declined offer doesn't use it up).
export default defineCard({
  name: "Baron Strucker, HYDRA Overlord",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 2,
  text:
    `${COST_TEXT}\n${CONNIVE_TEXT} ` +
    "(Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Villain" }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Villain" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have it connive?",
        oncePerTurn: true,
        effect: { kind: "connive", target: "trigger-object" },
      },
      resolve: null,
      text: CONNIVE_TEXT,
    },
  ],
});
