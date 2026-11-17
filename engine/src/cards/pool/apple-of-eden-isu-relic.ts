import { defineCard } from "../define.js";

// EDHREC rank 11319.
//
// The look, then the whole hand exiled face down in one move, its activator
// still allowed to look at those cards (rule 406.3) and to play them this
// turn — a land at its normal timing, as their land play (the rulings), mana
// of any type spent on a spell. "Whenever you play a land or cast a spell
// this way" is the permission's: a delayed triggered ability (603.7) for each
// card played under it, the card its trigger object, its owner the drawer.
// The cards the end step returns are the ones still exiled as those objects
// (400.7): one played, or back in exile some other way, stays where it is.
// Cards the opponent draws later are never exiled (the ruling).

const TEXT =
  "{T}, Pay 4 life, Sacrifice Apple of Eden: Look at target opponent's hand and exile those cards face down. You may play those cards this turn, and mana of any type can be spent to cast them. Until end of turn, whenever you play a land or cast a spell this way, its owner draws a card. At the beginning of the next end step, return the exiled cards to their owner's hand. Activate only as a sorcery.";

export default defineCard({
  name: "Apple of Eden, Isu Relic",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 4, sacrifice: "self" },
      sorcerySpeed: true,
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-at-hand", target: 0 },
          { kind: "exile-graveyard", target: 0, fromHand: "only", faceDown: "looked" },
          {
            kind: "grant-play",
            cards: { thisWay: "exiled" },
            duration: "end-of-turn",
            play: true,
            spendAs: "any-type",
            whenCast: {
              lands: true,
              effect: { kind: "draw", amount: 1, who: { ownerOf: "trigger-object" } },
              text: "Whenever you play a land or cast a spell this way, its owner draws a card.",
            },
          },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "exiled",
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "return-to-hand", target: 0, from: "exile" },
            },
            text: "At the beginning of the next end step, return the exiled cards to their owner's hand.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
