import { defineCard } from "../define.js";

// EDHREC rank 23999.

export default defineCard({
  name: "Predation Steward",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: "This creature enters with two oil counters on it.\n{2}{G}, {T}, Remove an oil counter from this creature: Target creature gets +2/+2 until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true, removeCounter: { kind: "oil", count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{G}, {T}, Remove an oil counter from this creature: Target creature gets +2/+2 until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: "This creature enters with two oil counters on it.",
    },
  ],
});
