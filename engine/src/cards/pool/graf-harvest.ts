import { defineCard } from "../define.js";

export default defineCard({
  name: "Graf Harvest",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Zombies you control have menace. (They can't be blocked except by two or more creatures.)\n{3}{B}, Exile a creature card from your graveyard: Create a 2/2 black Zombie creature token.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Zombie" },
      grantKeywords: ["menace"],
      text: "Zombies you control have menace.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: "{3}{B}, Exile a creature card from your graveyard: Create a 2/2 black Zombie creature token.",
    },
  ],
});
