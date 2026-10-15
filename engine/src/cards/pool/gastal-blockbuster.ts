import { defineCard } from "../define.js";

// EDHREC rank 23308.
//
// Rulings:
//   [2025-02-07] You don't choose a target for the enters ability. If you choose to sacrifice a
//     creature or Vehicle, a second trigger, called a reflexive trigger, is put on the stack, and
//     you choose a target for that one. Players may respond as normal to this new triggered
//     ability.
//
// Cavalier of Night's shape. Not "another": this creature may be the one
// sacrificed.

const ETB_TEXT =
  "When this creature enters, you may sacrifice a creature or Vehicle. When you do, destroy target artifact an opponent controls.";

export default defineCard({
  name: "Gastal Blockbuster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
            text: "Sacrifice a creature or Vehicle",
          },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", whose: "opponent", filter: { type: "artifact" } }],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target artifact an opponent controls.",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
