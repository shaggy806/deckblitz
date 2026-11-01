import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] This card's ability does not override effects which prevent a permanent from
//     untapping.
//   [2005-08-01] Permanents with multiple types untap if any of their types is chosen. For example,
//     an artifact creature untaps if either artifact or creature is chosen.
//   [2005-08-01] If another effect limits the number of permanents that untap, that number combines
//     with Storage Matrix's effect.

const TEXT =
  "As long as this artifact is untapped, each player chooses artifact, creature, or land during their untap step. That player can untap only permanents of the chosen type this step.";

export default defineCard({
  name: "Storage Matrix",
  manaCost: "{3}",
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      untapOnlyChosenType: { who: "each-player", types: ["artifact", "creature", "land"] },
      text: TEXT,
    },
  ],
});
