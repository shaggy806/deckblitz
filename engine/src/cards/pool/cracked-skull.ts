import { defineCard } from "../define.js";

// EDHREC rank 14286.
//
// Rulings:
//   [2024-09-20] A creature blocked by a creature enchanted with Cracked Skull still needs to
//     assign damage equal to the enchanted creature's toughness (minus any damage already marked
//     on the enchanted creature) before trampling over to a player, planeswalker, or battle.
//
// The enters trigger is Oildeep Gearhulk's look-and-maybe-choose over a
// nonland filter (nothing is revealed: only the Aura's controller looks). The
// damage trigger is Cryoshatter's.
const ENTER_TEXT =
  "When this Aura enters, look at target player's hand. You may choose a nonland card from it. That player discards that card.";
const DAMAGE_TEXT = "When enchanted creature is dealt damage, destroy it.";

export default defineCard({
  name: "Cracked Skull",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, lookOnly: true, optional: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
