import { defineCard } from "../define.js";

// EDHREC rank 15985.
//
// "Enters or attacks" is two triggers. The target opponent reveals until a
// historic ("artifact, legendary, or Saga" — Arbaaz Mir's filter) permanent
// card; the card found is `then`'s slot 0, put onto the battlefield under
// Jhoira's controller's control, and "that permanent's mana value" is read
// once it's there (a Clone-like artifact that copied something has the
// copy's), so only if it got there. The rest go to the bottom in a random
// order; with no historic permanent card, all of them do.
const TEXT =
  "Whenever Jhoira enters or attacks, target opponent reveals cards from the top of their library until they reveal a historic permanent card. You put that card onto the battlefield under your control and lose life equal to that permanent's mana value. That player puts the rest of the revealed cards on the bottom of their library in a random order.";

const HISTORIC_PERMANENT_CARD = {
  typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
  anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
} as const;

const REVEAL = {
  kind: "reveal-until",
  whose: 0,
  filter: HISTORIC_PERMANENT_CARD,
  then: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-onto-battlefield" },
        then: { kind: "lose-life", amount: { manaValueOf: 0 } },
      },
    ],
  },
  rest: "bottom-random",
} as const;

export default defineCard({
  name: "Jhoira, Weatherlight Corsair",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 4,
  toughness: 5,
  text: `${TEXT} (Artifacts, legendaries, and Sagas are historic.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: REVEAL,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["opponent"],
      effect: REVEAL,
      resolve: null,
      text: TEXT,
    },
  ],
});
