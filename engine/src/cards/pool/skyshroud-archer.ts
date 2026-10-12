import { defineCard } from "../define.js";

export default defineCard({
  name: "Skyshroud Archer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 1,
  text: "{T}: Target creature with flying gets -1/-1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature with flying gets -1/-1 until end of turn.",
    },
  ],
});
