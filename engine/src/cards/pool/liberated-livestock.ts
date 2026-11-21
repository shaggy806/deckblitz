import { defineCard } from "../define.js";

// EDHREC rank 18539. The three tokens are the ones created this way
// (`thisWay: "created"` — every one, so a doubled creation's extra tokens each
// get a turn too, its ruling); each in turn, its controller may put one Aura
// card from their hand or graveyard onto the battlefield attached to it
// (`return-from-graveyard` `from: "hand-or-graveyard"`, `attachedTo` its
// slot). An Aura that can't enchant that token stays where it was (rule
// 303.4i — its ruling).
//
// Rulings:
//   If Liberated Livestock's ability causes more than the expected number of tokens to be
//     created (due to an effect such as that of Doubling Season), you may put an Aura card from
//     your hand and/or graveyard onto the battlefield attached to each of the additional tokens
//     as well.
//   If you attempt to put an Aura onto the battlefield this way and that Aura can't legally be
//     attached to the token, that Aura does not enter the battlefield at all. Instead, it will
//     stay in its previous zone.

const DIES_TEXT =
  "When this creature dies, create a 1/1 white Cat creature token with lifelink, a 1/1 white Bird creature token with flying, and a 2/4 white Ox creature token. For each of those tokens, you may put an Aura card from your hand and/or graveyard onto the battlefield attached to it.";

export default defineCard({
  name: "Liberated Livestock",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Bird", "Ox"],
  power: 4,
  toughness: 6,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Lifelink Cat Token", count: 1 },
          { kind: "create-token", token: "Bird Token", count: 1 },
          { kind: "create-token", token: "Ox Token (Ox Drover)", count: 1 },
          {
            kind: "for-each-permanent",
            filter: { thisWay: "created" },
            effect: {
              kind: "may",
              prompt: "Put an Aura card from your hand or graveyard onto the battlefield attached to this token?",
              effect: {
                kind: "return-from-graveyard",
                filter: { subtype: "Aura" },
                destination: "battlefield",
                count: 1,
                from: "hand-or-graveyard",
                attachedTo: 0,
              },
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
