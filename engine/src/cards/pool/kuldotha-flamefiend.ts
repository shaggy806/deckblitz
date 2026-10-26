import { defineCard } from "../define.js";

// EDHREC rank 31012.
//
// Rulings: the targets and the division are chosen as the trigger goes on the stack; the
// sacrifice is chosen as it resolves. Zero targets is allowed (you may still sacrifice); if
// every target has become illegal the ability doesn't resolve, so nothing is sacrificed.
const TEXT =
  "When this creature enters, you may sacrifice an artifact. If you do, this creature deals 4 damage divided as you choose among any number of targets.";

export default defineCard({
  name: "Kuldotha Flamefiend",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "any-target", min: 0, max: 4 }],
      divided: { total: 4, slot: 0 },
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: { kind: "damage-divided", from: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
