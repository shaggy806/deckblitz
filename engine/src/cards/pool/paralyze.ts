import { defineCard } from "../define.js";

// EDHREC rank 20679. The upkeep trigger is Paralyze's own (the 2007 ruling),
// on the upkeep of the enchanted creature's controller — Wanderlust's shape:
// each upkeep, with "the enchanted creature's controller is the active player"
// as part of the trigger condition (`whileCondition`, rule 603.1). That player
// — the active player — may pay {4}; if they do, the creature untaps.
//
// Rulings: paying is optional; it can untap the creature only once per turn
// (one upkeep trigger); two Paralyzes aren't cumulative — paying either one's
// {4} untaps it.

const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const UPKEEP_TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, that player may pay {4}. If the player does, untap the creature.";

export default defineCard({
  name: "Paralyze",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Pay {4} to untap the creature enchanted by Paralyze?",
        options: [{ pay: "{4}", text: "Pay {4} to untap it" }],
        ifDid: { kind: "untap", target: "attached" },
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
