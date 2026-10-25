import { defineCard } from "../define.js";

export default defineCard({
  name: "Vanguard of Brimaz",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nHeroic — Whenever you cast a spell that targets this creature, create a 1/1 white Cat Soldier creature token with vigilance.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "create-token", token: "Cat Soldier Token (Vigilance)", count: 1 },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets this creature, create a 1/1 white Cat Soldier creature token with vigilance.",
    },
  ],
});
