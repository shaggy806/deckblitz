import { defineCard } from "../define.js";

const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, this creature gets +3/+0 until end of turn and can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Nivix Cyclops",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 1,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
          { kind: "attack-despite-defender", target: "source" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
