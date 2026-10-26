import { defineCard } from "../define.js";

const HEROIC =
  "Heroic — Whenever you cast a spell that targets this creature, create a 1/1 red Soldier creature token with haste.";

export default defineCard({
  name: "Akroan Crusader",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${HEROIC} (It can attack and {T} as soon as it comes under your control.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      // The token's haste is printed on it (tokens/soldier-token-red-1-1.ts), so a copy of it has haste too.
      effect: { kind: "create-token", token: "1/1 Red Soldier Token", count: 1 },
      resolve: null,
      text: HEROIC,
    },
  ],
});
