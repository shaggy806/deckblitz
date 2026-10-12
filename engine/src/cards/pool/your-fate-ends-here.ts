import { defineCard } from "../define.js";

export default defineCard({
  name: "Your Fate Ends Here",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature or planeswalker with mana value 3 or greater. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: [
    {
      kind: "permanent",
      filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "gte", n: 3 } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "surveil", amount: 1 }],
  },
});
