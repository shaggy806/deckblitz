import { defineCard } from "../define.js";

export default defineCard({
  name: "Lightbringer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Rebel"],
  power: 2,
  toughness: 2,
  text: "{T}, Sacrifice this creature: Exile target black creature.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { colors: ["B"], type: "creature" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{T}, Sacrifice this creature: Exile target black creature.",
    },
  ],
});
