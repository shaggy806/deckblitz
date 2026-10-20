import { defineCard } from "../define.js";

// EDHREC rank 12790. Commander Legends (CMR).
//
// "Non-Elf creatures get -3/-3" affects only the creatures on the battlefield
// as it resolves (the ruling) — `modify-pt-all` is a one-shot over them.
//
// Rulings:
//   [2020-11-10] Elvish Dreadlord's middle ability affects only creatures on the battlefield that
//     aren't Elves at the time it resolves. Non-Elf creatures that enter the battlefield later in
//     the turn won't get -3/-3.
//   [2020-11-10] Each token must attack the appropriate player if able.

const DIES_TEXT = "When this creature dies, non-Elf creatures get -3/-3 until end of turn.";
const ENCORE_TEXT =
  "Encore {5}{B}{B} ({5}{B}{B}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Elvish Dreadlord",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Elf"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DIES_TEXT}\n${ENCORE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", notSubtypes: ["Elf"] },
        power: -3,
        toughness: -3,
        duration: "end-of-turn",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{B}{B}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
