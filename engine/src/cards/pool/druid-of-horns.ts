import { defineCard } from "../define.js";

const TEXT = "Whenever you cast an Aura spell that targets this creature, create a 3/3 green Beast creature token.";

export default defineCard({
  name: "Druid of Horns",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Aura", targets: { source: true } } },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Beast Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
