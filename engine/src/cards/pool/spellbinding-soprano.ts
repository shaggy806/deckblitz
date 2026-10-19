import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// The attack trigger is Armor Wars' `player-effect` `reduceSpells`: a
// discount for the rest of the turn that outlives the creature (each
// trigger its own, so two attacks are {2}). Encore is Broodmate Tyrant's
// graveyard ability; each encore token is a copy, so its attack makes a
// discount of its own.
const ATTACK_TEXT = "Whenever this creature attacks, instant and sorcery spells you cast this turn cost {1} less to cast.";
const ENCORE_TEXT =
  "Encore {3}{R} ({3}{R}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Spellbinding Soprano",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${ENCORE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        reduceSpells: { applies: { typesAnyOf: ["instant", "sorcery"] }, reduceGeneric: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
