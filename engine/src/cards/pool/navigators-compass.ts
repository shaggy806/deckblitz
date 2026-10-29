import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// EDHREC rank 20805.
//
// The type is chosen as the ability resolves (`choose-creature-type` over the
// five basic land types) and added "in addition" (`addSubtypes` — not rule
// 305.7: the land keeps its abilities and gains the type's mana ability).
//
// Rulings:
//   [2018-04-27] Gaining a basic land type causes the target land to gain the corresponding mana
//     ability. Because the new basic land type is "in addition to" its other types, it keeps the
//     abilities it had previously.

const TAP_TEXT =
  "{T}: Until end of turn, target land you control becomes the basic land type of your choice in addition to its other types.";

export default defineCard({
  name: "Navigator's Compass",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `When this artifact enters, you gain 3 life.\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land-you-control"],
      effect: {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "choose a basic land type",
        then: { kind: "add-types", target: 0, addSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this artifact enters, you gain 3 life.",
    },
  ],
});
