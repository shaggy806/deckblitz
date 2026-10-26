import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 22424.
//
// Rulings:
//   [2022-12-08] Ovinomancer is a legal target for its own ability. Activating that ability will
//     cause Ovinomancer to return to its owner's hand, so the ability will have an illegal target.
//     It won't resolve, and no one will create a Sheep token.
//
// The return is all three or nothing: offered (as a "may") only to a player
// who controls three basic lands, and then exactly three. With three not
// returned this way, Ovinomancer is sacrificed.

const ENTER_TEXT = "When this creature enters, sacrifice it unless you return three basic lands you control to their owner's hand.";
const ABILITY_TEXT =
  "{T}, Return this creature to its owner's hand: Destroy target creature. It can't be regenerated. That creature's controller creates a 0/1 green Sheep creature token.";
const BASIC_LANDS = { type: "land", supertype: "basic", controlledBy: "you" } as const;

export default defineCard({
  name: "Ovinomancer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 1,
  text: `${ENTER_TEXT}\n${ABILITY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "controls", filter: BASIC_LANDS, atLeast: 3 },
            then: {
              kind: "may",
              prompt: "Return three basic lands you control to their owner's hand? (If you don't, sacrifice Ovinomancer.)",
              effect: {
                kind: "choose-permanents",
                filter: BASIC_LANDS,
                min: 3,
                upTo: 3,
                then: { kind: "return-to-hand", target: 0 },
                prompt: "Return three basic lands you control to their owner's hand",
              },
            },
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "returned-to-hand", atLeast: 3 } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, returnSelfToHand: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0, cantBeRegenerated: true },
          { kind: "create-token", token: "Green Sheep Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
