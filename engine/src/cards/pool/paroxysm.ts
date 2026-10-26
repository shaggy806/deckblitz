import { defineCard } from "../define.js";

// EDHREC rank 31153. Soul Bleed's trigger: the upkeep of the enchanted
// creature's controller, who is the active player and reveals. Not optional
// (its ruling).
const TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, that player reveals the top card of their library. If that card is a land card, destroy that creature. Otherwise, it gets +3/+3 until end of turn.";

export default defineCard({
  name: "Paroxysm",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "reveal-top",
        who: "active-player",
        then: {
          kind: "conditional",
          condition: { kind: "this-way", what: "revealed", filter: { type: "land" }, atLeast: 1 },
          then: { kind: "destroy", target: "attached" },
          else: { kind: "modify-pt", target: "attached", power: 3, toughness: 3, duration: "end-of-turn" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
