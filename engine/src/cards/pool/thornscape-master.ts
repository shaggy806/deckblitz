import { defineCard } from "../define.js";

// EDHREC rank 31528.

export default defineCard({
  name: "Thornscape Master",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{R}{R}, {T}: This creature deals 2 damage to target creature.\n{W}{W}, {T}: Target creature gains protection from the color of your choice until end of turn.",
  activated: [
    {
      cost: { mana: "{R}{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}{R}, {T}: This creature deals 2 damage to target creature.",
    },
    {
      cost: { mana: "{W}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}{W}, {T}: Target creature gains protection from the color of your choice until end of turn.",
    },
  ],
});
