import { defineCard } from "../define.js";

// EDHREC rank 8736.

const ENTERS = "When this creature enters, you get six {E} (energy counters).";
const BOUNCE = "Pay {E}{E}{E}{E}: Return this creature to its owner's hand.";

export default defineCard({
  name: "Aethertide Whale",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 6,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}\n${BOUNCE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 6 },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 4 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
