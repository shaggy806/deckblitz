import { equip } from "../helpers.js";
import { defineCard } from "../define.js";

// Its values locked in as it begins: what it copied can then leave or change (the
// ruling). Moved or fallen off — a copy of a noncreature makes the host stop being
// one, and the Equipment falls — it's what it was again (the ruling).
const ATTACHED_TEXT =
  "Whenever this Equipment becomes attached to a creature, for as long as this Equipment remains attached to it, you may have that creature become a copy of another target creature you control.";

export default defineCard({
  name: "Blade of Shared Souls",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)\n${ATTACHED_TEXT}\nEquip {2}`,
  activated: [equip("{2}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Rebel Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: "For Mirrodin!",
    },
    {
      trigger: { on: "becomes-attached", who: "self", filter: { type: "creature" } },
      targets: [
        { kind: "permanent", filter: { type: "creature", controlledBy: "you", not: { attachments: { filter: { isSource: true } } } } },
      ],
      effect: {
        kind: "may",
        prompt: "Have that creature become a copy of the target creature for as long as this Equipment remains attached to it?",
        effect: { kind: "become-copy", target: "trigger-object", of: 0, until: "while-source-attached" },
      },
      resolve: null,
      text: ATTACHED_TEXT,
    },
  ],
});
