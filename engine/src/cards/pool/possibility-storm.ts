import { defineCard } from "../define.js";

// Rulings:
//   [2013-04-15] The original spell is part of the group of exiled cards put on the bottom of the
//     library in a random order. If the exiled card that shared a card type with that card wasn't
//     cast, it's also part of this group.
//   [2013-04-15] If the spell you cast from exile has X in its mana cost, you must choose 0 as its
//     value.
//   [2013-04-15] If Possibility Storm's ability doesn't exile the original spell (perhaps because
//     another Possibility Storm already exiled it), you'll still exile cards from the top of your
//     library until you exile a card that shares a card type with it and have the opportunity to
//     cast that spell.
//
// "That player" does it all (`as-player`): they exile the spell and the cards,
// so they are the ones who exiled them ("cards you exiled"), and they cast.
// "It" is the spell, acted on only while it's still that spell on the stack
// (`movedRefAct`); every card the ability exiles is exiled with this
// enchantment (rule 607.2a), so "all cards exiled with this enchantment" is the
// original spell and every card the reveal exiled that wasn't cast.

const TEXT =
  "Whenever a player casts a spell from their hand, that player exiles it, then exiles cards from the top of their library until they exile a card that shares a card type with it. That player may cast that card without paying its mana cost. Then they put all cards exiled with this enchantment on the bottom of their library in a random order.";

export default defineCard({
  name: "Possibility Storm",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", from: "hand" },
      targets: [],
      effect: {
        kind: "as-player",
        who: "trigger-player",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object", linked: true },
            {
              kind: "reveal-until",
              filter: { sharesCardTypeWith: { typesOf: "trigger-object" } },
              exile: true,
              linked: true,
              then: { kind: "cast-now", target: 0, free: true },
              rest: "stay",
            },
            { kind: "return-exiled-by-source", linked: "bottom-random" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
