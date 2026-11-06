import { defineCard } from "../define.js";

// EDHREC rank 27484.
//
// One ability with two trigger events (`sameAbilityAs`), as Frodo Baggins's:
// Spot itself, token or not, and each other nontoken legendary permanent.

const FOOD_TEXT =
  "Whenever Spot or another nontoken legendary permanent you control enters, create a Food token. (It's an " +
  'artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")';
const DESTROY_TEXT = "{4}, Sacrifice a Food: Destroy target artifact.";

export default defineCard({
  name: "Spot, Felis catus",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  text: `${FOOD_TEXT}\n${DESTROY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { supertype: "legendary", token: false },
        otherOnly: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false, sacrifice: { filter: { subtype: "Food" } } },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
