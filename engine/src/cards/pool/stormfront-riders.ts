import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 23126. Khalni Gem's untargeted return.
//
// Rulings:
//   [2021-03-19] A token you own that's returned to your hand moves to your hand before it ceases
//     to exist. This will cause the last ability of Stormfront Riders to trigger.
//   [2021-03-19] You may return Stormfront Riders itself to its owner's hand as its triggered
//     ability resolves. If you don't control two other creatures, you must return it.
//   [2021-03-19] If Stormfront Riders and another creature are returned to your hand at the same
//     time, its last ability triggers for each of them.
//   [2021-03-19] If you control only one creature as the triggered ability resolves, you return it
//     to its owner's hand.

const ENTER_TEXT = "When this creature enters, return two creatures you control to their owner's hand.";
const RETURN_TEXT =
  "Whenever this creature or another creature is returned to your hand from the battlefield, create a 1/1 white Soldier creature token.";

export default defineCard({
  name: "Stormfront Riders",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Two, or as many as you control (the ruling) — the choice clamps `min`
      // to what's eligible.
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        upTo: 2,
        min: 2,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return two creatures you control to their owner's hand",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // "Your hand": a creature you own, whoever controlled it — read as it
      // last existed on the battlefield.
      trigger: { on: "leaves-battlefield", who: "any", filter: { type: "creature", ownedBy: "you" }, to: ["hand"] },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
