import { defineCard } from "../define.js";

// EDHREC rank 21566.
//
// Rulings:
//   [2024-07-26] Use the power of the exiled creature as it last existed on the battlefield to
//     determine whether or not to put a +1/+1 counter on Driftgloom Coyote.
//   [2024-07-26] Auras attached to the exiled creature will be put into their owners’ graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled creature will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//   [2024-07-26] If a token is exiled this way, it will cease to exist and won’t return to the
//     battlefield.
//   [2024-07-26] If Driftgloom Coyote leaves the battlefield before its triggered ability
//     resolves, the target creature won’t be exiled.

// Detention Chariot's exile-until-it-leaves, with its linked return (rule
// 610.3). "If that creature had power 2 or less" reads the target as it last
// existed on the battlefield (the `target` condition, rule 608.2h — the
// ruling), so a token that ceased to exist still counts. If this creature
// has left before the trigger resolves, nothing is exiled (the ruling).
const ENTER_TEXT =
  "When this creature enters, exile target creature an opponent controls until this creature leaves the battlefield. If that creature had power 2 or less, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Driftgloom Coyote",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental", "Coyote"],
  power: 3,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { power: { op: "lte", n: 2 } } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // The exile's linked return (rule 610.3).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card.",
    },
  ],
});
