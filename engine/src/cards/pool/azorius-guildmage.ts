import { defineCard } from "../define.js";

// Dissension. EDHREC rank 14812.

export default defineCard({
  name: "Azorius Guildmage",
  manaCost: "{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{2}{W}: Tap target creature.\n{2}{U}: Counter target activated ability. (Mana abilities can't be targeted.)",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{2}{W}: Tap target creature.",
    },
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "ability", abilityKind: "activated" }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{2}{U}: Counter target activated ability. (Mana abilities can't be targeted.)",
    },
  ],
});
