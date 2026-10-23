import { defineCard } from "../define.js";

// EDHREC rank 7525.
//
// "Cast from your hand" is only a spell you cast from your hand: put onto the
// battlefield any other way, or cast from the command zone, it loses you the
// game (the rulings).
const ENTER_TEXT = "When Phage enters, if you didn't cast it from your hand, you lose the game.";
const CREATURE_TEXT = "Whenever Phage deals combat damage to a creature, destroy that creature. It can't be regenerated.";
const PLAYER_TEXT = "Whenever Phage deals combat damage to a player, that player loses the game.";

export default defineCard({
  name: "Phage the Untouchable",
  manaCost: "{3}{B}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Minion"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${CREATURE_TEXT}\n${PLAYER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "not", of: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } } },
      targets: [],
      effect: { kind: "lose-game" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient", cantBeRegenerated: true },
      resolve: null,
      text: CREATURE_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "lose-game", who: "trigger-player" },
      resolve: null,
      text: PLAYER_TEXT,
    },
  ],
});
