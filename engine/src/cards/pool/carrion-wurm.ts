import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Torment. EDHREC rank 30392.
//
// Phantasmagorian's frame: every player is asked in turn (the option is
// offered only to one with three cards in their graveyard); once any player
// has exiled three, the Wurm assigns no combat damage this turn — the same
// result however many do. One trigger for attacking, one for blocking.

const TEXT =
  "Whenever this creature attacks or blocks, any player may exile three cards from their graveyard. If a player does, this creature assigns no combat damage this turn.";

const ANY_PLAYER_MAY_EXILE: EffectSpec = {
  kind: "each-player-may",
  who: "each-player",
  options: [{ exileFromGraveyard: 3, text: "Exile three cards from your graveyard so Carrion Wurm assigns no combat damage" }],
  ifDid: { kind: "assigns-no-combat-damage", target: "source" },
};

export default defineCard({
  name: "Carrion Wurm",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wurm"],
  power: 6,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: ANY_PLAYER_MAY_EXILE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: ANY_PLAYER_MAY_EXILE,
      resolve: null,
      text: TEXT,
    },
  ],
});
