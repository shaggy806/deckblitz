import { defineCard } from "../define.js";

export default defineCard({
  name: "Hateflayer",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)\n{2}{R}, {Q}: This creature deals damage equal to its power to any target. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, untap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: "{2}{R}, {Q}: This creature deals damage equal to its power to any target.",
    },
  ],
});
