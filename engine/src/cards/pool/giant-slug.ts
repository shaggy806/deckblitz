import type { ModeOption } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 29897.
//
// Rulings:
//   [2004-10-04] If the Slug changes controllers after the mana is spent, the player who
//     activates this ability selects a landwalk during their next upkeep even if they don't
//     control it at the time.
//   [2004-10-04] When the ability resolves, it creates another ability that triggers at the
//     beginning of your next upkeep. When that ability resolves, you choose a basic land type.
//
// The activation sets up a delayed trigger at its activator's next upkeep
// (rule 603.7); as that resolves, they choose one of the five basic land
// types — a choice among five, each granting the matching landwalk until
// the end of that turn.
const TEXT =
  "{5}: At the beginning of your next upkeep, choose a basic land type. This creature gains landwalk of the chosen type until the end of that turn.";

const LANDWALKS = [
  ["Plains", "plainswalk"],
  ["Island", "islandwalk"],
  ["Swamp", "swampwalk"],
  ["Mountain", "mountainwalk"],
  ["Forest", "forestwalk"],
] as const;

const MODES: readonly ModeOption[] = LANDWALKS.map(([landType, keyword]) => ({
  text: `${landType}: this creature gains ${keyword} until end of turn.`,
  effect: { kind: "grant-keyword", target: "source", keyword, duration: "end-of-turn" },
}));

export default defineCard({
  name: "Giant Slug",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Slug"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "your-next-upkeep",
        effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
        text: "Choose a basic land type. Giant Slug gains landwalk of the chosen type until end of turn.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
