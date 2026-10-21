import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 30862.
// Rulings:
//   The counters are placed on the creature to which it enters attached. If you later move
//   Venarian Gold to a different creature, the counters remain on the original creature and
//   no counters are put on the new creature.
// The X is the Aura spell's (Awakened Awareness's shape). The untap clause
// reads the enchanted creature's sleep counters as it is now; the upkeep
// trigger is Unstable Mutation's, with "the enchanted creature's controller
// is the active player" part of the trigger condition (rule 603.1).

const ENTERS_TEXT = "When this Aura enters, tap enchanted creature and put X sleep counters on it.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step if it has a sleep counter on it.";
const UPKEEP_TEXT = "At the beginning of the upkeep of enchanted creature's controller, remove a sleep counter from that creature.";

export default defineCard({
  name: "Venarian Gold",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS_TEXT}\n${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "add-counter", target: "attached", counter: "sleep", amount: "x" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "remove-counter", target: "attached", counter: "sleep", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: {
        kind: "source",
        filter: { attachedTo: { counters: { kind: "sleep", compare: { op: "gte", n: 1 } } } },
      },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
