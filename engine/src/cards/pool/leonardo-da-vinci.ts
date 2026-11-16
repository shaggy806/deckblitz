import { defineCard } from "../define.js";

// EDHREC rank 11168; top-1000 commander #693.
//
// Rulings:
//   - Except for the listed exceptions, the token copies exactly what was
//     printed on the discarded card and nothing else.
//   - The token is a Thopter artifact creature in addition to its other
//     types. Its power and toughness are 0/2, and it has flying. These are
//     copiable values of the token that other effects may copy.
//   - If the copied card has {X} in its mana cost, X is 0.
//   - Any enters-the-battlefield abilities of the copied card will trigger
//     when the token enters the battlefield. Any "as [this artifact]" enters
//     the battlefield or "[this artifact] enters the battlefield with"
//     abilities of the copied card will also work.
//   - The value of X is determined only as Leonardo's first ability resolves.
//     Once that happens, the value of X won't change later in the turn even
//     if the number of cards in your hand changes.
//
// The Thopters are Jolrael's shape: fixed as the ability resolves (rules
// 611.2c, 608.2h). "The discarded card" is the one discarded this way, still
// in the graveyard it went to (`inZone`: a card madness exiled instead isn't
// there to exile); "if you do" is the `exiled` this-way condition, and the
// token copies that card as it is in exile (rule 707.2), with the exceptions
// as copiable values (707.9b).
const THOPTERS_TEXT =
  "{3}{U}{U}: Until end of turn, Thopters you control have base power and toughness X/X, where X is the number of cards in your hand.";
const LOOT_TEXT =
  "{2}{U}, {T}: Draw a card, then discard a card. If the discarded card was an artifact card, exile it from your graveyard. If you do, create a token that's a copy of it, except it's a 0/2 Thopter artifact creature with flying in addition to its other types.";

export default defineCard({
  name: "Leonardo da Vinci",
  art: "https://scryfall.com/card/acr/20",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: `${THOPTERS_TEXT}\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "become",
        filter: { subtype: "Thopter", controlledBy: "you" },
        power: { cardsInHand: "you" },
        toughness: { cardsInHand: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: THOPTERS_TEXT,
    },
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { type: "artifact", inZone: "graveyard" } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: { thisWay: "discarded" } },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "exiled" },
                  then: {
                    kind: "create-token-copy",
                    of: { thisWay: "exiled" },
                    count: 1,
                    who: "you",
                    exceptions: {
                      power: 0,
                      toughness: 2,
                      addTypes: ["artifact", "creature"],
                      addSubtypes: ["Thopter"],
                      keywords: ["flying"],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
