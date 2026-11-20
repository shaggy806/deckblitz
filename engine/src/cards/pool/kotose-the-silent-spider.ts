import { defineCard } from "../define.js";

// Surgical Extraction's search (graveyard, hand and library, then that player
// shuffles) after exiling the target, then one `grant-play` over every card
// exiled this way with `upTo: 1`: the cards share one play (a
// `GameState.permissionGroups` entry), so once one is played the rest stay in
// exile (the ruling). "For as long as you control Kotose" is
// `while-you-control-source`: lost for good with control of this Kotose, or
// with it leaving (the rulings, rule 400.7).

const ENTER_TEXT =
  "When Kotose enters, exile target card other than a basic land card from an opponent's graveyard. Search that player's graveyard, hand, and library for any number of cards with the same name as that card and exile them. Then that player shuffles. For as long as you control Kotose, you may play one of the exiled cards, and you may spend mana as though it were mana of any color to cast it.";

export default defineCard({
  name: "Kotose, the Silent Spider",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "opponent",
          filter: { anyOf: [{ notTypes: ["land"] }, { notSupertype: "basic" }] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "search-library",
            whose: { ownerOf: 0 },
            zones: "graveyard-hand-library",
            filter: { sameNameWith: 0 },
            destination: "exile",
            min: 0,
            max: 99,
          },
          {
            kind: "grant-play",
            cards: { thisWay: "exiled" },
            duration: "while-you-control-source",
            play: true,
            upTo: 1,
            spendAs: "any-color",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
