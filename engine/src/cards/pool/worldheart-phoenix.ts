import { defineCard } from "../define.js";

// EDHREC rank 30458.
//
// Rulings:
//   [2009-02-01] As soon as you start to cast Worldheart Phoenix from your graveyard, the card
//     moves onto the stack. At that point, it's too late for an opponent to prevent you from
//     casting it by removing it from your graveyard.
//   [2009-02-01] If you cast Worldheart Phoenix this way, it is a spell and can be countered.
//   [2009-02-01] Casting Worldheart Phoenix from your graveyard by paying its alternative cost
//     doesn't change when you can cast it. You can cast it only at the normal time you could
//     cast a creature spell.
//
// Its own graveyard permission (rule 113.6f), its alternative cost `byPaying`.
// "If you do" is that permission's `entersWith`: the counters ride on the
// spell cast under it alone, so another permission casting it from the
// graveyard for its mana cost gives none.
const CAST_TEXT =
  "You may cast this card from your graveyard by paying {W}{U}{B}{R}{G} rather than paying its mana cost. If you do, it enters with two +1/+1 counters on it.";

export default defineCard({
  name: "Worldheart Phoenix",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}`,
  mayPlaySelf: {
    from: ["graveyard"],
    byPaying: "{W}{U}{B}{R}{G}",
    entersWith: { kind: "+1/+1", amount: 2 },
  },
});
