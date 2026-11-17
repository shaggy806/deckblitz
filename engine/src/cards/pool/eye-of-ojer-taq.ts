import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 13041.
//
// Rulings:
//   If a card that isn't a transforming double-faced card becomes a copy of a card with craft,
//     it'll stay in exile if you activate the craft ability. It won't return to the battlefield.
//   If the materials required include multiple objects, you may exile some of them from among
//     permanents you control and the rest from among cards in your graveyard.
//   You may exile tokens you control as part of the materials required. However, because they
//     aren't cards and won't stay in exile, any abilities that refer to what you "used to craft"
//     the back faces won't refer to anything.

const CRAFT_TEXT =
  "Craft with two that share a card type {6} ({6}, Exile this artifact, Exile the two from among other permanents you control and/or cards from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Eye of Ojer Taq",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add one mana of any color.\n${CRAFT_TEXT}`,
  activated: [
    addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." }),
    {
      cost: {
        mana: "{6}",
        tap: false,
        do: { kind: "exile", target: "source" },
        craft: { count: 2, share: "card-type", text: "two that share a card type" },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "craft-return" },
      resolve: null,
      text: "Craft with two that share a card type {6}",
    },
  ],
  faces: ["Eye of Ojer Taq", "Apex Observatory"],
  transform: true,
});
