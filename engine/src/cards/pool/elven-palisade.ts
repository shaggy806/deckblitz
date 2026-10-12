import { defineCard } from "../define.js";

export default defineCard({
  name: "Elven Palisade",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Sacrifice a Forest: Target attacking creature gets -3/-0 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Forest" } } },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice a Forest: Target attacking creature gets -3/-0 until end of turn.",
    },
  ],
});
