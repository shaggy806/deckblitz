import { defineCard } from "../define.js";

export default defineCard({
  name: "Rabid Rats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: "{T}: Target blocking creature gets -1/-1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target blocking creature gets -1/-1 until end of turn.",
    },
  ],
});
