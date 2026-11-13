import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// Rulings:
//   You may cast a spell from among the exiled cards only as Tasha's last loyalty ability
//     resolves. You may not wait and cast a spell from among them at a later time.
//
// "A spell you don't own" is one an opponent owns (rule 108.3) — Don Andres, the Renegade's
// filter. The +1's "for each opponent, … from that player's graveyard" is one optional slot a
// seat, 1–3; each card is exiled with its page counter, one instruction. The −3 reads every
// face-up card in exile with a page counter, whoever owns it and whatever put the counter there.
const PLUS = "+1: Draw a card. For each opponent, exile up to one target instant or sorcery card from that player's graveyard and put a page counter on it.";
const MINUS = "−3: You may cast a spell from among cards in exile with page counters on them without paying its mana cost.";

const spellCardOf = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "card-in-graveyard", whose: { seat }, filter: { typesAnyOf: ["instant", "sorcery"] } },
});
const PAGE = { kind: "page", amount: 1 } as const;

export default defineCard({
  name: "Tasha, the Witch Queen",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tasha"],
  loyalty: 4,
  canBeCommander: true,
  text: `Whenever you cast a spell you don't own, create a 3/3 black Demon creature token.\n${PLUS}\n${MINUS}\nTasha, the Witch Queen can be your commander.`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { ownedBy: "opponent" } },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Demon Token", count: 1 },
      resolve: null,
      text: "Whenever you cast a spell you don't own, create a 3/3 black Demon creature token.",
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [spellCardOf(1), spellCardOf(2), spellCardOf(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "sequence",
            simultaneous: true,
            effects: [0, 1, 2].map((slot) => ({ kind: "exile" as const, target: slot, withCounters: PAGE })),
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "cast-now", from: { exiledWithCounter: "page" }, free: true },
      resolve: null,
      text: MINUS,
    },
  ],
});
