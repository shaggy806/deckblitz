import { defineCard } from "../define.js";

const LURE = "Sacrifice a Food: Target creature blocks this creature this turn if able.";

export default defineCard({
  name: "Maraleaf Rider",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 3,
  toughness: 1,
  text: LURE,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Food" } } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "must-block", attacker: "source" }] },
      resolve: null,
      text: LURE,
    },
  ],
});
