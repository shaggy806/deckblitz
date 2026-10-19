import { defineCard } from "../define.js";

const DIES_TEXT = "When this creature dies, if it wasn't blocking, draw a card.";

// "If it wasn't blocking" reads the creature as it last existed on the
// battlefield (rule 603.10a): blocking as it died.
export default defineCard({
  name: "Guildsworn Prowler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Tiefling", "Rogue", "Assassin"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { blocking: false } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
