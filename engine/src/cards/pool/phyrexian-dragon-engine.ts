import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 8465.
//
// The front half of a meld pair, as Hanweir Garrison and The Mightstone and
// Weakstone are: melding is Mishra, Claimed by Gix's ability, not this card's,
// so nothing on this card is left out — its line about melding is reminder
// text. (The meld rulings concern only the melded permanent and the
// instruction to meld.)
//
// "Enters from your graveyard" is the permanent's `enteredFrom` (River
// Kelpie) and a card you own, judged from the trigger's controller's side
// (Flayer of the Hatebound): reanimated by an opponent from your graveyard,
// it didn't enter from *their* graveyard, so theirs doesn't trigger. Cast
// from a graveyard, it enters from the stack. Byway Barterer's optional
// discard-your-hand — offered with an empty hand too — then three cards.

const ENTERS_TEXT = "When this creature enters from your graveyard, you may discard your hand. If you do, draw three cards.";

export default defineCard({
  name: "Phyrexian Dragon Engine",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Dragon"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${ENTERS_TEXT}\nUnearth {3}{R}{R}\n(Melds with Mishra, Claimed by Gix.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { enteredFrom: "graveyard", ownedBy: "you" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw three cards?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: 3 },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [unearth("{3}{R}{R}")],
});
