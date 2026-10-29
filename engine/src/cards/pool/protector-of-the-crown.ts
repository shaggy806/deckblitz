import { defineCard } from "../define.js";

// EDHREC rank 11388.
// Rulings:
//   [2020-11-10] Applying this redirection effect doesn't change whether the damage is combat
//     damage.
//   [2020-11-10] Protector of the Crown's last ability doesn't depend on you being the monarch.
//
// A static redirection (rule 614.9), Palisade Giant's shape narrowed to you.

export default defineCard({
  name: "Protector of the Crown",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 2,
  toughness: 5,
  text: "When this creature enters, you become the monarch.\nAll damage that would be dealt to you is dealt to this creature instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: "When this creature enters, you become the monarch.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", redirect: "self" },
      text: "All damage that would be dealt to you is dealt to this creature instead.",
    },
  ],
});
