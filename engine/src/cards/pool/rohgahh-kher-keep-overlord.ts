import { defineCard } from "../define.js";

// Rulings:
//   [2022-09-09] Each of Rohgahh, Kher Keep Overlord’s last two abilities goes on the stack above
//     the spell that caused it to trigger and resolves first. It resolves even if that spell is
//     countered or otherwise left the stack.

export default defineCard({
  name: "Rohgahh, Kher Keep Overlord",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kobold", "Warrior"],
  power: 4,
  toughness: 4,
  text: "Other Kobolds you control get +2/+2.\nWhenever you cast a Kobold spell, you may pay {2}. If you do, create a 4/4 red Dragon creature token with flying.\nWhenever you cast a Dragon spell, create a 0/1 red Kobold creature token named Kobolds of Kher Keep.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Kobold" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a 4/4 red Dragon?",
        cost: "{2}",
        effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 1 },
      },
      resolve: null,
      text: "Whenever you cast a Kobold spell, you may pay {2}. If you do, create a 4/4 red Dragon creature token with flying.",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Dragon" } },
      targets: [],
      effect: { kind: "create-token", token: "Kobolds of Kher Keep", count: 1 },
      resolve: null,
      text: "Whenever you cast a Dragon spell, create a 0/1 red Kobold creature token named Kobolds of Kher Keep.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Kobold", excludeSelf: true },
      grantPt: [2, 2],
      text: "Other Kobolds you control get +2/+2.",
    },
  ],
});
