import { defineCard } from "../define.js";

// EDHREC rank 14917. X is the exiled card's mana value, read off the cost
// (Necropolis's `{ paid: "exiled" }`).

export default defineCard({
  name: "Ellie and Alan, Paleontologists",
  manaCost: "{2}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 2,
  toughness: 5,
  text: "{T}, Exile a creature card from your graveyard: Discover X, where X is the mana value of the exiled card. Activate only as a sorcery. (Exile cards from the top of your library until you exile a nonland card with that mana value or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "discover", amount: { manaValueOf: { paid: "exiled" } } },
      resolve: null,
      sorcerySpeed: true,
      text: "{T}, Exile a creature card from your graveyard: Discover X, where X is the mana value of the exiled card. Activate only as a sorcery.",
    },
  ],
});
