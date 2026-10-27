import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever you cast an instant or sorcery spell, create a 1/1 blue Human Wizard creature token. Then if you control three or more Wizards, transform this creature.";

export default defineCard({
  name: "Docent of Perfection",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Human Wizard Token", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 3 },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  faces: ["Docent of Perfection", "Final Iteration"],
  transform: true,
});
