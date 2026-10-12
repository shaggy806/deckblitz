import { defineCard } from "../define.js";

export default defineCard({
  name: "Skeletal Vampire",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Skeleton"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create two 1/1 black Bat creature tokens with flying.\n{3}{B}{B}, Sacrifice a Bat: Create two 1/1 black Bat creature tokens with flying.\nSacrifice a Bat: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: false, sacrifice: { filter: { subtype: "Bat" } } },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 2 },
      resolve: null,
      text: "{3}{B}{B}, Sacrifice a Bat: Create two 1/1 black Bat creature tokens with flying.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Bat" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice a Bat: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 black Bat creature tokens with flying.",
    },
  ],
});
