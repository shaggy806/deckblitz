import { defineCard } from "../define.js";

// EDHREC rank 23937.
// Rulings: if Hixus leaves before the ability resolves, nothing is exiled;
// the exiled card returns right after Hixus leaves the battlefield.

export default defineCard({
  name: "Hixus, Prison Warden",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nWhenever a creature deals combat damage to you, if Hixus entered this turn, exile that creature until Hixus leaves the battlefield. (That creature returns under its owner's control.)",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "you", combat: true },
      condition: { kind: "source", filter: { enteredThisTurn: true } },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", untilSourceLeaves: true },
      resolve: null,
      text: "Whenever a creature deals combat damage to you, if Hixus entered this turn, exile that creature until Hixus leaves the battlefield.",
    },
  ],
});
