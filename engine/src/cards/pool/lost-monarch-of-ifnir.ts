import { defineCard } from "../define.js";
import { afflict } from "../helpers.js";

// EDHREC rank 3094.

export default defineCard({
  name: "Lost Monarch of Ifnir",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Noble"],
  power: 4,
  toughness: 4,
  text: "Afflict 3 (Whenever this creature becomes blocked, defending player loses 3 life.)\nOther Zombies you control have afflict 3.\nAt the beginning of your second main phase, if a player was dealt combat damage by a Zombie this turn, mill three cards, then you may return a creature card from your graveyard to your hand.",
  triggered: [
    afflict(3),
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      // A Zombie as it dealt the damage, whoever's it was and wherever it is now.
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "turn-history", what: "combat-damaged-by", who: "any-player", filter: { subtype: "Zombie" } },
        ],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          { kind: "look-and-choose", zone: "graveyard", min: 0, max: 1, destination: "hand", leftover: "stay", filter: { type: "creature" } },
        ],
      },
      resolve: null,
      text: "At the beginning of your second main phase, if a player was dealt combat damage by a Zombie this turn, mill three cards, then you may return a creature card from your graveyard to your hand.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Zombie", controlledBy: "you", isSource: false } },
      grantsTriggered: [afflict(3)],
      text: "Other Zombies you control have afflict 3.",
    },
  ],
});
