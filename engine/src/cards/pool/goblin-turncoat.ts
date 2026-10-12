import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Turncoat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Mercenary"],
  power: 2,
  toughness: 1,
  text: "Sacrifice a Goblin: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Goblin" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice a Goblin: Regenerate this creature.",
    },
  ],
});
