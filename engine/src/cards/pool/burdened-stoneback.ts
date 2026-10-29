import { defineCard } from "../define.js";

// EDHREC rank 20757.

export default defineCard({
  name: "Burdened Stoneback",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  text: "This creature enters with two -1/-1 counters on it.\n{1}{W}, Remove a counter from this creature: Target creature gains indestructible until end of turn. Activate only as a sorcery. (Damage and effects that say \"destroy\" don't destroy it. If its toughness is 0 or less, it still dies.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, removeCounter: { kind: "any", count: 1 } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}, Remove a counter from this creature: Target creature gains indestructible until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: "This creature enters with two -1/-1 counters on it.",
    },
  ],
});
