import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 10440.
// Two optional slots: up to one creature you control to attach to, and up to
// one creature other than that one to destroy (Daily Bugle Reporters' "other
// than slot 0"). Each half happens without the other.

const ENTER_TEXT =
  "When this Equipment enters, attach it to up to one target creature you control. Destroy up to one other target creature.";

export default defineCard({
  name: "Phantom Blade",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\nEquipped creature gets +1/+1 and has menace. (It can't be blocked except by two or more creatures.)\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature-you-control" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0, attachment: "source" },
          { kind: "destroy", target: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["menace"],
      text: "Equipped creature gets +1/+1 and has menace.",
    },
  ],
  activated: [equip("{2}")],
});
