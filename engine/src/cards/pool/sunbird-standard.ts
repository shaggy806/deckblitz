import { defineCard } from "../define.js";

// EDHREC rank 14156. Front face; the back reads the colors of the cards used
// to craft it.
//
// Rulings:
//   [2023-11-10] You may exile tokens you control as part of the materials required. However,
//     because they aren't cards and won't stay in exile, any abilities that refer to what you
//     "used to craft" the back faces won't refer to anything.
//   [2023-11-10] If the materials required include multiple objects, you may exile some of them
//     from among permanents you control and the rest from among cards in your graveyard. You don't
//     have to choose all permanents or all cards from your graveyard.
//   [2023-11-10] If a card that isn't a transforming double-faced card becomes a copy of a card
//     with craft, it'll stay in exile if you activate the craft ability. It won't return to the
//     battlefield.
//   [2023-11-10] The back faces of some cards with craft refer to cards "used to craft" it. This
//     refers to the cards exiled as part of the cost of the craft ability of the front face. Those
//     cards are considered to be "used to craft" that permanent as long as they remain exiled and
//     the permanent remains on the battlefield, even if the permanent's controller changes or some
//     of its characteristics change (because of a copy effect, for example.)
//   [2023-11-10] The five colors are white, blue, black, red, and green, and as such, Sunbird
//     Effigy's characteristic-defining ability can't set its power and toughness higher than 5/5.
//     Similarly, Sunbird Effigy's last ability can produce at most five mana (one of each of
//     color).
export default defineCard({
  name: "Sunbird Standard",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add one mana of any color.\nCraft with one or more {5} ({5}, Exile this artifact, Exile one or more other permanents you control and/or cards from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: {
        mana: "{5}",
        tap: false,
        do: { kind: "exile", target: "source" },
        craft: { count: 1, orMore: true, text: "one or more" },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "craft-return" },
      resolve: null,
      text: "Craft with one or more {5}",
    },
  ],
  faces: ["Sunbird Standard", "Sunbird Effigy"],
  transform: true,
});
