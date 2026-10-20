import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, it deals damage to the player or planeswalker it's attacking equal to the number of artifacts you control.";
const ENCORE_TEXT =
  "Encore {5}{R} ({5}{R}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Fathom Fleet Swordjack",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 4,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${ENCORE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // Mage Slayer's shape: one removed from combat since isn't attacking
      // anything, so deals nothing; one that has left the battlefield still
      // deals it, as it last existed (the rulings).
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { attacking: true } },
        then: {
          kind: "damage",
          amount: { countOf: { type: "artifact", controlledBy: "you" } },
          toTriggerRecipient: true,
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{R}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
