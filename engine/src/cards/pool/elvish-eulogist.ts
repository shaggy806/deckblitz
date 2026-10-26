import { defineCard } from "../define.js";

// Ruling (2007-10-01): by the time the ability resolves, the Eulogist itself
// is in the graveyard (sacrificed as the cost), so it counts itself.

export default defineCard({
  name: "Elvish Eulogist",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: You gain 1 life for each Elf card in your graveyard.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countInGraveyard: { subtype: "Elf", ownedBy: "you" } } },
      resolve: null,
      text: "Sacrifice this creature: You gain 1 life for each Elf card in your graveyard.",
    },
  ],
});
