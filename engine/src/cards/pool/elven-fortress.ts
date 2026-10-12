import { defineCard } from "../define.js";

export default defineCard({
  name: "Elven Fortress",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "{1}{G}: Target blocking creature gets +0/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{G}: Target blocking creature gets +0/+1 until end of turn.",
    },
  ],
});
