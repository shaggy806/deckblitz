import { defineCard } from "../define.js";

// Marvel. One ability that works from either zone (rule 113.6m: it moves its
// card out of them): `zone` lists both, and each activation works from the one
// the card is in. Persistent Specimen's shape otherwise: the cost doesn't move
// the card, which the effect finds only if it's still there (400.7).

const TEXT = "{2}{G}: Return this card from your graveyard or from exile to the battlefield tapped.";

export default defineCard({
  name: "Mister Immortal",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Mutant", "Hero"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      zone: ["graveyard", "exile"],
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
