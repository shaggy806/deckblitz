import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 13999.

const ENTER = "When this Vehicle enters, you get {E}{E} (two energy counters).";
const LIFELINK = "Pay {E}: This Vehicle gains lifelink until end of turn.";

export default defineCard({
  name: "Aethersphere Harvester",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTER}\n${LIFELINK}\n${crewText(1)}`,
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 1 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK,
    },
    crew(1, crewText(1)),
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER,
    },
  ],
});
