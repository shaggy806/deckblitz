import { defineCard } from "../define.js";

export default defineCard({
  name: "Horror of Horrors",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Sacrifice a Swamp: Regenerate target black creature. (The next time that creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Swamp" } } },
      targets: [{ kind: "permanent", filter: { colors: ["B"], type: "creature" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "Sacrifice a Swamp: Regenerate target black creature.",
    },
  ],
});
