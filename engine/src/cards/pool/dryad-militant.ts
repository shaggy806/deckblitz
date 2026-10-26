import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 19016.
//
// Rulings:
//   [2012-10-01] If an instant or sorcery spell destroys Dryad Militant directly (like Murder
//     does), that instant or sorcery card will be put into its owner's graveyard. However, if an
//     instant or sorcery card deals lethal damage to Dryad Militant, ... The instant or sorcery
//     will be exiled.
//
// Rest in Peace's replacement, narrowed by Anafenza, the Foremost's filter.
const EXILE_TEXT = "If an instant or sorcery card would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Dryad Militant",
  manaCost: "{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Dryad", "Soldier"],
  power: 2,
  toughness: 1,
  text: `({G/W} can be paid with either {G} or {W}.)\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      text: EXILE_TEXT,
    },
  ],
});
