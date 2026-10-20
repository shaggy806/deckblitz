import { defineCard } from "../define.js";

// EDHREC rank 22761. Commander Legends (CMR).
//
// Rulings:
//   [2020-11-10] Once a creature with power 3 or greater has blocked this creature, changing the
//     power of the blocking creature won't cause this creature to become unblocked.
//   [2020-11-10] Each token must attack the appropriate player if able.

const ENCORE_TEXT =
  "Encore {4}{G} ({4}{G}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Fin-Clade Fugitives",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Salamander", "Rogue"],
  power: 7,
  toughness: 4,
  text: `This creature can't be blocked by creatures with power 2 or less.\n${ENCORE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
