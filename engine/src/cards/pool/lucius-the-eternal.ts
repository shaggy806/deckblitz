import { defineCard } from "../define.js";

// EDHREC rank 16298.
//
// Rulings:
//   [2022-10-07] If the target creature leaves the battlefield before Lucius the Eternal's ability
//     resolves, Lucius will stay in your graveyard and will not be exiled or return to the
//     battlefield.
//
// The target is the ability's only one, so with it gone the ability doesn't
// resolve at all (rule 608.2b — the ruling). The return waits on that
// creature leaving for any zone (a `leaves` delayed trigger), and is set up
// only once Lucius was exiled this way: "this card" is the card that ability
// exiled (rule 400.7), and the delayed ability returns its source only while
// it's still that object in exile.

const ARMOUR_TEXT =
  "Armour of Shrieking Souls — When Lucius the Eternal dies, exile it and choose target creature an opponent controls. When that creature leaves the battlefield, return this card from exile to the battlefield under its owner's control.";

export default defineCard({
  name: "Lucius the Eternal",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 5,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${ARMOUR_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "delayed-trigger",
              at: { leaves: 0, to: ["graveyard", "exile", "hand", "library", "command"] },
              effect: { kind: "put-onto-battlefield", target: "source" },
              text: "Return Lucius the Eternal from exile to the battlefield under its owner's control.",
            },
          },
        ],
      },
      resolve: null,
      text: ARMOUR_TEXT,
    },
  ],
});
