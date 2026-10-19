import { defineCard } from "../define.js";

// EDHREC rank 13595.
//
// Rapid Regeneration counts every cast of your commanders from the command
// zone (Commander's Insignia's count), two counters each (Ancient
// Imperiosaur's `product`). Xenos Cunning's "a counter" is any kind: the
// `counters` filter with no `kind`, read as the creature last existed.

const REGEN_TEXT =
  "Rapid Regeneration — The Swarmlord enters with two +1/+1 counters on it for each time you've cast your commander from the command zone this game.";
const CUNNING_TEXT = "Xenos Cunning — Whenever a creature you control with a counter on it dies, draw a card.";

export default defineCard({
  name: "The Swarmlord",
  manaCost: "{3}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 5,
  toughness: 5,
  text: `${REGEN_TEXT}\n${CUNNING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { product: [{ commanderCasts: "you" }, 2] } },
      },
      text: REGEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: CUNNING_TEXT,
    },
  ],
});
