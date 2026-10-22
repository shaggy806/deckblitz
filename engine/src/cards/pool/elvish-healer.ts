import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31846.
//
// Rulings:
//   [2004-10-04] It checks the color of the creature on resolution of the ability.

const TEXT =
  "{T}: Prevent the next 1 damage that would be dealt to any target this turn. If it's a green creature, prevent the next 2 damage instead.";

export default defineCard({
  name: "Elvish Healer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature", colors: ["G"] } },
        then: { kind: "prevent-damage", target: 0, amount: 2 },
        else: { kind: "prevent-damage", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
