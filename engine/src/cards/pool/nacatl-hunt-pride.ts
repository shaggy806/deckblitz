import { defineCard } from "../define.js";

// EDHREC rank 28906. The second ability is a
// `block-if-able` requirement with no attacker named: block any attacker.

export default defineCard({
  name: "Nacatl Hunt-Pride",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\n{R}, {T}: Target creature can't block this turn.\n{G}, {T}: Target creature blocks this turn if able.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{R}, {T}: Target creature can't block this turn.",
    },
    {
      cost: { mana: "{G}", tap: true },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0 },
      resolve: null,
      text: "{G}, {T}: Target creature blocks this turn if able.",
    },
  ],
});
