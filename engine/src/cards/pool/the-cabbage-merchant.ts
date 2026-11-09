import { defineCard } from "../define.js";

// EDHREC rank 2153.
export default defineCard({
  name: "The Cabbage Merchant",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: "Whenever an opponent casts a noncreature spell, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nWhenever a creature deals combat damage to you, sacrifice a Food token.\nTap two untapped Foods you control: Add one mana of any color.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", noncreatureOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "Whenever an opponent casts a noncreature spell, create a Food token.",
    },
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "you", combat: true },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { subtype: "Food", token: true }, count: 1 },
      resolve: null,
      text: "Whenever a creature deals combat damage to you, sacrifice a Food token.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 2, filter: { subtype: "Food", controlledBy: "you" }, includeSelf: true } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "Tap two untapped Foods you control: Add one mana of any color.",
    },
  ],
});
