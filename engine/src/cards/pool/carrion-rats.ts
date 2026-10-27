import { defineCard } from "../define.js";

// Torment. EDHREC rank 21849. Dash Hopes' "any player may": each player in
// turn from the active player (rule 101.4) may exile a card from their own
// graveyard, offered only with one there; any one doing it is enough. Ophidian's
// `assigns-no-combat-damage` on the Rats themselves.

const TEXT =
  "Whenever this creature attacks or blocks, any player may exile a card from their graveyard. If a player does, this creature assigns no combat damage this turn.";
const EFFECT = {
  kind: "each-player-may",
  who: "each-player",
  options: [{ exileFromGraveyard: 1, text: "Exile a card from your graveyard" }],
  ifDid: { kind: "assigns-no-combat-damage", target: "source" },
} as const;

export default defineCard({
  name: "Carrion Rats",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});
