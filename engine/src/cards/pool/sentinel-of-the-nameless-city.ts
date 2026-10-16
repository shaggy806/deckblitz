import { defineCard } from "../define.js";

export default defineCard({
  name: "Sentinel of the Nameless City",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior", "Scout"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever this creature enters or attacks, create a Map token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Map Token", count: 1 },
      resolve: null,
      text: "Whenever this creature enters or attacks, create a Map token.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Map Token", count: 1 },
      resolve: null,
      text: "Whenever this creature enters or attacks, create a Map token.",
    },
  ],
});
