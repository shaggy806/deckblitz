import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 11127.
//
// Rulings:
//   [2025-07-25] Although the creature you put onto the battlefield is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won’t
//     trigger when that creature enters attacking.
//   [2025-07-25] You choose the player, planeswalker, or battle the creature you put onto the
//     battlefield is attacking. It doesn’t have to be the same player, planeswalker, or battle
//     that the enchanted creature or any other attacking creatures are attacking.
// "Defending player" is the attack trigger's player — the one the enchanted
// creature attacks. The creature put onto the battlefield attacks whatever its
// controller chooses (rule 508.4, the ruling). "Sacrifice this Aura unless
// …" isn't an intervening if: the trigger always fires, and the void
// condition is read as it resolves.

const ATTACK_TEXT =
  "Whenever enchanted creature attacks, put target creature card from defending player's graveyard onto the battlefield under your control tapped and attacking.";
const VOID_TEXT =
  "Void — At the beginning of your end step, sacrifice this Aura unless a nonland permanent left the battlefield this turn or a spell was warped this turn.";

export default defineCard({
  name: "Chorale of the Void",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ATTACK_TEXT}\n${VOID_TEXT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "card-in-graveyard", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        underYourControl: true,
        enterTapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "conditional", condition: { kind: "not", of: VOID_CONDITION }, then: { kind: "sacrifice-source" } },
      resolve: null,
      text: VOID_TEXT,
    },
  ],
});
