import { defineCard } from "../define.js";

export default defineCard({
  name: "Lawbringer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Rebel"],
  power: 2,
  toughness: 2,
  text: "{T}, Sacrifice this creature: Exile target red creature.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { colors: ["R"], type: "creature" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{T}, Sacrifice this creature: Exile target red creature.",
    },
  ],
});
