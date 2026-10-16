import { defineCard } from "../define.js";

// EDHREC rank 9574.
//
// Rulings:
//   [2023-11-10] The triggered ability will resolve before Bygone Marvels does. If Bygone Marvels
//     is countered in response to its own triggered ability, you will still copy Bygone Marvels
//     twice.
//   [2023-11-10] Some descend triggered abilities include intervening "if" clauses (i.e. "if you
//     have [four or eight] permanent cards in your graveyard" in the middle of the ability). Each
//     of these abilities checks your graveyard at the moment it would trigger to see if it does.
//     If you don't have the required number of permanent cards in your graveyard at that time, the
//     ability doesn't trigger at all. If it does trigger, it will check again as it tries to
//     resolve. If you don't have the required number of permanent cards in your graveyard at that
//     time, the ability won't resolve and none of its effects will happen.
//   [2023-11-10] Cards with the ability word "descend N" have abilities that care if you have at
//     least N permanent cards in your graveyard.

// Descend 8 is an intervening "if" on the cast trigger (rule 603.4 — the
// ruling): checked as it triggers and again as it resolves. The copies are
// Summon: G.F. Cerberus's `count: 2`, of the spell as it last was on the
// stack if it has been countered since (the ruling). "Exile Bygone Marvels"
// is `exileOnResolve`; a copy ceases to exist anyway (rule 707.10a).
const CAST_TEXT =
  "Descend 8 — When you cast this spell, if there are eight or more permanent cards in your graveyard, copy this spell twice. You may choose new targets for the copies.";
const RESOLVE_TEXT = "Return target permanent card from your graveyard to your hand. Exile Bygone Marvels.";

export default defineCard({
  name: "Bygone Marvels",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${CAST_TEXT}\n${RESOLVE_TEXT}`,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  exileOnResolve: true,
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "cards-in-graveyard", atLeast: 8, filter: { notTypes: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: 2 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
