import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 26009. "If it was a creature" reads the
// Totem as it last existed on the battlefield.
//
// Rulings:
//   [2006-09-25] Weatherseed Totem will be returned to its owner's hand if it was a creature at
//     the time it was put into a graveyard from the battlefield.

const ANIMATE_TEXT =
  "{2}{G}{G}{G}: This artifact becomes a 5/3 green Treefolk artifact creature with trample until end of turn.";
const RETURN_TEXT =
  "When this artifact is put into a graveyard from the battlefield, if it was a creature, return this card to its owner's hand.";

export default defineCard({
  name: "Weatherseed Totem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {G}.\n${ANIMATE_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: "{2}{G}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Treefolk"],
        setColors: ["G"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
