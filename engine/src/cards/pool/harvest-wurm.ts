import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 27524.
//
// Rulings:
//   [2008-04-01] When the ability resolves, you choose whether to sacrifice the creature or
//     perform the other action. If you can't perform the other action, then you must sacrifice the
//     creature.
//   [2008-04-01] If the creature is no longer on the battlefield when the ability resolves, you
//     may still perform the action if you want.
//
// Balduvian Horde's frame: with no basic land card in your graveyard it's
// sacrificed unasked; otherwise you may return one (your choice of which,
// with more than one), or sacrifice it.

const TEXT =
  "When this creature enters, sacrifice it unless you return a basic land card from your graveyard to your hand.";

export default defineCard({
  name: "Harvest Wurm",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "land", supertype: "basic" } },
        then: {
          kind: "may",
          prompt: "Return a basic land card from your graveyard to your hand to keep Harvest Wurm?",
          effect: {
            kind: "return-from-graveyard",
            filter: { type: "land", supertype: "basic" },
            destination: "hand",
            count: 1,
          },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
