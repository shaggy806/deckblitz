import { defineCard } from "../define.js";

const IMPRINT_TEXT = "Imprint — When this artifact enters, you may exile target land you control.";
const MANA_TEXT =
  "Whenever a land with the same name as the exiled card is tapped for mana, its controller adds one mana of any type that land produced.";

// Mana Flare's triggered mana ability (rule 605.1b) for the lands named like the
// card linked to this permanent (rule 607.2a), whoever controls them.
export default defineCard({
  name: "Extraplanar Lens",
  manaCost: "{3}",
  types: ["artifact"],
  text: `${IMPRINT_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control"],
      effect: {
        kind: "may",
        prompt: "Exile target land you control?",
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
    {
      trigger: {
        on: "tapped-for-mana",
        who: "any",
        filter: { type: "land", sameNameWith: "exiled-with-source" },
      },
      targets: [],
      effect: { kind: "add-mana", mana: "produced", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
