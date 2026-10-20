import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a spell with mana value 4 or greater, create a 1/1 colorless Thopter artifact creature token with flying.";

export default defineCard({
  name: "Etherium Spinner",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
