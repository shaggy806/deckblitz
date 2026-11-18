import { defineCard } from "../define.js";

// EDHREC rank 13906. The land gets the quoted static (`grantsStatic`), which
// works from the land itself, as Bender's Waterskin's own does: it untaps
// along with the active player's permanents in their untap step (rule 502.3),
// and the controller can't choose to leave it tapped (the second ruling).
//
// Rulings:
//   [2012-10-01] Effects that state that the enchanted land doesn't untap during your untap step
//     won't apply during another player's untap step.
//   [2012-10-01] The enchanted land untaps at the same time as the active player's permanents. You
//     can't choose to not untap it at that time.
const GRANTED = "Untap this land during each other player's untap step.";
const TEXT = `Enchanted land has "${GRANTED}"`;

export default defineCard({
  name: "Urban Burgeoning",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsStatic: [{ affects: { scope: "self" }, untapsDuringOthersUntap: "self", text: GRANTED }],
      text: TEXT,
    },
  ],
});
