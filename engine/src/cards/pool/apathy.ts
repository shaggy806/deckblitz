import { defineCard } from "../define.js";

// EDHREC rank 23369. Paralyze's shape: the upkeep trigger fires on the upkeep of
// the enchanted creature's controller (`whileCondition`), and that player — the
// active player — may discard a card at random. "If the player does" reads the
// discard itself (`this-way` discarded), so saying yes with an empty hand
// untaps nothing. Ruling: they may discard whether the creature is tapped or not.

const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const UPKEEP_TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, that player may discard a card at random. If the player does, untap that creature.";

export default defineCard({
  name: "Apathy",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Discard a card at random to untap the creature enchanted by Apathy?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1, random: true },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", atLeast: 1 },
              then: { kind: "untap", target: "attached" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
