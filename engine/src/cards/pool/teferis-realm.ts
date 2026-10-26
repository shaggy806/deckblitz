import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 23315.
//
// Rulings:
//   Does not affect token permanents, only cards.
//   Can affect itself if you choose "non-Aura enchantment".
//   This has the supertype world (rule 704.5k — the world rule).
//
// The player whose upkeep it is must choose one of the four (a villainous-
// choice-style `choices`, asked of the active player); every nontoken
// permanent of that type, anyone's, phases out.

const TEXT =
  "At the beginning of each player's upkeep, that player chooses artifact, creature, land, or non-Aura enchantment. All nontoken permanents of that type phase out.";

export default defineCard({
  name: "Teferi's Realm",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `${TEXT} (While they're phased out, they're treated as though they don't exist. Each one phases in before its controller untaps during their next untap step.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        choices: [
          { text: "Artifact", effect: { kind: "phase-out", filter: { type: "artifact", token: false } } },
          { text: "Creature", effect: { kind: "phase-out", filter: { type: "creature", token: false } } },
          { text: "Land", effect: { kind: "phase-out", filter: { type: "land", token: false } } },
          {
            text: "Non-Aura enchantment",
            effect: { kind: "phase-out", filter: { type: "enchantment", notSubtypes: ["Aura"], token: false } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
