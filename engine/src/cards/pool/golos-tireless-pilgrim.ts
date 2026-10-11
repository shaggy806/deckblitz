import { defineCard } from "../define.js";

// Banned in Commander; in the pool for casual play.
//
// Rulings:
//   [2019-07-12] If you don't play some or all of the cards exiled with Golos's last ability, those
//     cards remain in exile.
//   [2019-07-12] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2019-07-12] If you cast a card "without paying its mana cost," you can't choose to cast it for
//     any alternative costs. You can, however, pay additional costs. If the card has any mandatory
//     additional costs (such as that of Bone Splinters), you must pay those to cast the card.
//   [2019-07-12] Golos's last ability doesn't change when you can play the exiled cards. For
//     example, if you exile a sorcery card, you can cast it only during your main phase when the
//     stack is empty. If you exile a land card, you can play it only during your main phase and
//     only if you have an available land play remaining.
//
// The permission is only to play them free (`only`: Mind's Desire's and
// Fallen Shinobi's shape) — a land as a land play, under its normal timing.

const ETB_TEXT =
  "When Golos enters, you may search your library for a land card, put that card onto the battlefield tapped, then shuffle.";
const EXILE_TEXT =
  "{2}{W}{U}{B}{R}{G}: Exile the top three cards of your library. You may play them this turn without paying their mana costs.";

export default defineCard({
  name: "Golos, Tireless Pilgrim",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Scout"],
  power: 3,
  toughness: 5,
  text: `${ETB_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "impulse-exile", amount: 3, duration: "end-of-turn", free: { only: true } },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
