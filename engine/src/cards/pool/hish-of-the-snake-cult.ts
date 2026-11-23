import { defineCard } from "../define.js";

const TYPES_TEXT = "Nagas and Serpents you control are Snakes. (We'll errata this to be true.)";
const GRANT_TEXT =
  "Snakes you control have daunt, deathtouch, and poisonous 2. (A creature with daunt can't be blocked by creatures with power 2 or less. Whenever a creature with poisonous 2 deals combat damage to a player, that player gets two poison counters.)";

export default defineCard({
  name: "Hish of the Snake Cult",
  manaCost: "{2}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 5,
  text: `${TYPES_TEXT}\n${GRANT_TEXT}`,
  static: [
    {
      // Layer 4: "are Snakes" — in addition to their other types (rule 205.1b).
      affects: { scope: "filter", filter: { subtypes: ["Naga", "Serpent"], controlledBy: "you" } },
      addSubtypes: ["Snake"],
      text: TYPES_TEXT,
    },
    {
      affects: { scope: "filter", filter: { subtype: "Snake", controlledBy: "you" } },
      grantKeywords: ["deathtouch"],
      // Daunt: can't be blocked by creatures with power 2 or less (checked as blockers are declared).
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "lte", n: 2 } } }],
      // Poisonous 2.
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "add-player-counters", counter: "poison", amount: 2, who: "trigger-player" },
          resolve: null,
          text: "Poisonous 2 (Whenever this creature deals combat damage to a player, that player gets two poison counters.)",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
