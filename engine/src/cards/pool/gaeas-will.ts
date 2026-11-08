import { defineCard } from "../define.js";

// No mana cost, so it can only be suspended (rule 118.6). Green by its color
// indicator.
//
// Rulings:
//   Nontoken creatures you own that would die are exiled instead; tokens die as normal.
//   Lands played and spells cast from your graveyard follow the usual timing, and are paid for.
//   It exiles itself after it finishes resolving (a copy goes to the graveyard briefly).
//
// The permission is Yawgmoth's Agenda's, for the turn; the replacement's
// `token: false` is "a card".
const SUSPEND_TEXT =
  "Suspend 4—{G} (Rather than cast this card from your hand, pay {G} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)";
const PLAY_TEXT = "Until end of turn, you may play lands and cast spells from your graveyard.";
const EXILE_TEXT = "If a card would be put into your graveyard from anywhere this turn, exile that card instead.";

export default defineCard({
  name: "Gaea's Will",
  colors: ["G"],
  types: ["sorcery"],
  text: `${SUSPEND_TEXT}\n${PLAY_TEXT}\n${EXILE_TEXT}`,
  suspend: { n: 4, cost: "{G}" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "graveyard", play: true } },
      { kind: "replacement-effect", duration: "end-of-turn", replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you", token: false } } },
    ],
  },
});
