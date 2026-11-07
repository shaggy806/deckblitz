import { defineCard } from "../define.js";

// Flagged "Build ASAP". Mug's cards are every player's milled card, each
// where the mill put it — a graveyard, or the exile a replacement put it in
// instead (Rest in Peace — rule 701.17c) — and the turn's permission is one
// spell among them all (`grant-graveyard-cast`'s `upTo`): once one is cast,
// none of the others may be. A land card is milled, not cast.

const EVADE_TEXT = "Locke can't be blocked by creatures with greater power.";
const MUG_TEXT =
  "Mug — Whenever Locke attacks, each player mills a card. If a land card was milled this way, create a Treasure token. Until end of turn, you may cast a spell from among those cards.";

export default defineCard({
  name: "Locke, Treasure Hunter",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: `${EVADE_TEXT}\n${MUG_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
      text: EVADE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { type: "land" } },
            then: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
          { kind: "grant-graveyard-cast", cards: "milled-this-way", upTo: 1 },
        ],
      },
      resolve: null,
      text: MUG_TEXT,
    },
  ],
});
