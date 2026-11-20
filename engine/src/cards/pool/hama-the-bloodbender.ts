import { defineCard } from "../define.js";

// EDHREC rank 16921.
//
// The card exiled isn't targeted: it's chosen as the ability resolves, after
// the mill, from that player's whole graveyard. The permission rides on the
// card, for as long as Hama's controller controls Hama, during their own turn
// and with the card's own timing, by waterbending {N} (N its mana value, X 0 —
// rule 107.3b) rather than its mana cost: an alternative cost (118.9a), each
// generic mana of which an untapped artifact or creature may pay by tapping
// (701.67a).

const TEXT =
  "When Hama enters, target opponent mills three cards. Exile up to one noncreature, nonland card from that player's graveyard. For as long as you control Hama, you may cast the exiled card during your turn by waterbending {X} rather than paying its mana cost, where X is its mana value. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)";

export default defineCard({
  name: "Hama, the Bloodbender",
  manaCost: "{2}{U/B}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            from: { target: 0 },
            filter: { notTypes: ["creature", "land"] },
            min: 0,
            max: 1,
            destination: "exile",
            leftover: "stay",
            mayPlay: { duration: "while-you-control-source", yourTurnOnly: true, byWaterbending: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
