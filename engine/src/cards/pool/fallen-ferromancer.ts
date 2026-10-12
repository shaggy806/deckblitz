import { defineCard } from "../define.js";

export default defineCard({
  name: "Fallen Ferromancer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Shaman"],
  power: 1,
  toughness: 1,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n{1}{R}, {T}: This creature deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}{R}, {T}: This creature deals 1 damage to any target.",
    },
  ],
});
