import { defineCard } from "../define.js";

// A choice of additional costs (rule 601.2b): blighting is offered only with
// a creature to blight (701.68b), and which one is chosen as it's paid.
export default defineCard({
  name: "Wild Unraveling",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, blight 2 or pay {1}. (To blight 2, put two -1/-1 counters on a creature you control.)\nCounter target spell.",
  additionalCost: {
    options: [
      { text: "Blight 2", blight: 2 },
      { text: "Pay {1}", mana: "{1}" },
    ],
  },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
