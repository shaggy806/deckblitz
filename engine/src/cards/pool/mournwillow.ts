import { defineCard } from "../define.js";

// A rule over every creature for the rest of the turn (rule 611.2c), read as
// blockers are declared: any creature with power 2 or less then can't block,
// whatever its power was as this resolved (the ruling).
const TEXT =
  "Delirium — When this creature enters, if there are four or more card types among cards in your graveyard, creatures with power 2 or less can't block this turn.";

export default defineCard({
  name: "Mournwillow",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Skeleton"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "delirium" },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        restrictions: ["cant-block"],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
