import { defineCard } from "../define.js";

// EDHREC rank 12306. Teenage Mutant Ninja Turtles.
//
// Rulings:
//   If a spell has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.
//   Some disappear abilities are triggered abilities with intervening if
//     clauses. If a permanent hasn't left the battlefield under your control
//     that turn by the time the disappear ability would trigger, it won't
//     trigger at all.
//   You cast the card while Krang & Shredder's last ability is resolving and
//     still on the stack. You can't wait to play it later in the turn. Timing
//     restrictions based on its types are ignored.
//
// "Enter or attack" is one ability with two trigger events (`sameAbilityAs`,
// Aang and Katara). Each opponent's library in turn order (Fevered
// Suspicion's `for-each-player` reveal-until), every card exiled **with this
// creature** (`linked`, rule 607.2a — lands too), in this battlefield stint:
// cards from an earlier stint are another object's (rule 400.7). Disappear
// is West Wind Avatar's intervening if, then Smirking Spelljacker's free
// cast of one card exiled with it, chosen as it resolves — a land is never
// offered, and X is 0 (rule 107.3b).

const EXILE_TEXT =
  "Whenever Krang & Shredder enter or attack, each opponent exiles cards from the top of their library until they exile a nonland card.";
const DISAPPEAR_TEXT =
  "Disappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, you may cast a card exiled with Krang & Shredder without paying its mana cost.";
const EXILE = {
  kind: "for-each-player",
  who: "each-opponent",
  effect: { kind: "reveal-until", whose: "that-player", filter: { notTypes: ["land"] }, exile: true, linked: true, rest: "stay" },
} as const;

export default defineCard({
  name: "Krang & Shredder",
  manaCost: "{4}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Utrom", "Human", "Ninja"],
  power: 6,
  toughness: 7,
  text: `${EXILE_TEXT}\n${DISAPPEAR_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      sameAbilityAs: 1,
      targets: [],
      effect: EXILE,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: EXILE,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "left" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", free: true },
      resolve: null,
      text: DISAPPEAR_TEXT,
    },
  ],
});
