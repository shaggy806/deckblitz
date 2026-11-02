import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, you get {E}{E}{E}{E} (four energy counters).";
const DIES =
  "When this creature dies, you may pay an amount of {E} equal to target nonland permanent's mana value. When you do, destroy that permanent.";

export default defineCard({
  name: "Behemoth of Vault 0",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ENTERS}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 4 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["nonland-permanent"],
      effect: {
        kind: "may",
        prompt: "Pay {E} equal to that permanent's mana value to destroy it?",
        costEnergy: { manaValueOf: 0 },
        effect: {
          kind: "reflexive-trigger",
          about: 0,
          targets: [],
          effect: { kind: "destroy", target: "trigger-object" },
          text: "When you do, destroy that permanent.",
        },
      },
      resolve: null,
      text: DIES,
    },
  ],
});
