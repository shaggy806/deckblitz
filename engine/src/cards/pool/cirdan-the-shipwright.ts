import { defineCard } from "../define.js";

// EDHREC rank 7850.
//
// One ability with two trigger events. After the votes are revealed, each
// player draws for the votes they received, then each player who received
// none may put a permanent card from their hand onto the battlefield — both
// in turn order from the active player (the ruling).

const VOTE_TEXT =
  "Secret council — Whenever Círdan enters or attacks, each player secretly votes for a player, then those votes are revealed. Each player draws a card for each vote they received. Each player who received no votes may put a permanent card from their hand onto the battlefield.";
const PERMANENT_CARD = { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] } as const;
const VOTE = {
  kind: "sequence",
  effects: [
    { kind: "vote", for: { player: "any" }, secret: true },
    {
      kind: "for-each-voted",
      which: "voted",
      effect: { kind: "draw", amount: { votesReceived: "that-player" }, who: "that-player" },
    },
    {
      kind: "for-each-voted",
      which: "unvoted",
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        player: "that-player",
        min: 0,
        max: 1,
        filter: PERMANENT_CARD,
        destination: "battlefield",
        leftover: "stay",
      },
    },
  ],
} as const;

export default defineCard({
  name: "Círdan the Shipwright",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${VOTE_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: VOTE, resolve: null, text: VOTE_TEXT },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: VOTE,
      resolve: null,
      text: VOTE_TEXT,
    },
  ],
});
