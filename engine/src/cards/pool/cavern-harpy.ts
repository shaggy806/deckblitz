import { defineCard } from "../define.js";

// Gating: the creature is chosen on resolution, not targeted (the ruling),
// and the Harpy itself qualifies.
const GATE = "When this creature enters, return a blue or black creature you control to its owner's hand.";
const BOUNCE = "Pay 1 life: Return this creature to its owner's hand.";

export default defineCard({
  name: "Cavern Harpy",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Harpy", "Beast"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${GATE}\n${BOUNCE}`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a blue or black creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
  ],
});
