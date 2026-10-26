import { defineCard } from "../define.js";

const TEXT =
  "{G}, Sacrifice a Forest: Put a +2/+2 counter on this creature. Activate only if this creature entered this turn.";

export default defineCard({
  name: "Fungus Elemental",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Elemental"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: { filter: { subtype: "Forest" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+2/+2", amount: 1 },
      resolve: null,
      text: TEXT,
      condition: { kind: "source", filter: { enteredThisTurn: true } },
    },
  ],
});
