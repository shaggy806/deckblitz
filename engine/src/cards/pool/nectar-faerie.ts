import { defineCard } from "../define.js";

// Rulings:
//   [2007-10-01] If you grant lifelink to a creature controlled by another player, that other
//     player will gain life when the creature deals damage.

export default defineCard({
  name: "Nectar Faerie",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{B}, {T}: Target Faerie or Elf gains lifelink until end of turn. (Damage dealt by the creature also causes its controller to gain that much life.)",
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: [{ kind: "permanent", filter: { subtypes: ["Faerie", "Elf"] } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "{B}, {T}: Target Faerie or Elf gains lifelink until end of turn.",
    },
  ],
});
