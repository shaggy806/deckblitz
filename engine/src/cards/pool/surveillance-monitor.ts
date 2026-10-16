import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, you may collect evidence 4.";
const COLLECT_TEXT =
  "Whenever you collect evidence, create a 1/1 colorless Thopter artifact creature token with flying.";

// Its own collecting triggers its second ability (rule 701.59 — the ruling).
export default defineCard({
  name: "Surveillance Monitor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Detective"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT} (Exile cards with total mana value 4 or greater from your graveyard.)\n${COLLECT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "collect-evidence", amount: 4 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "evidence-collected", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: COLLECT_TEXT,
    },
  ],
});
