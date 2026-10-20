import { defineCard } from "../define.js";

// "That creature": the one it blocks (`blocks`'s `object: "blocked"`), or the
// non-Wall blocking it (`blocked-by`'s blocker) — destroyed at end of combat by
// a delayed trigger, only if it's still that creature (rule 400.7).
const T0 = "Whenever this creature blocks a creature, destroy that creature at end of combat.";
const T1 = "Whenever this creature becomes blocked by a non-Wall creature, destroy that creature at end of combat.";

export default defineCard({
  name: "Infernal Medusa",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 2,
  toughness: 4,
  text: `${T0}\n${T1}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "delayed-trigger", at: "end-of-combat", effect: { kind: "destroy", target: "trigger-object" }, text: "Destroy that creature." },
      resolve: null,
      text: T0,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notSubtypes: ["Wall"] } },
      targets: [],
      effect: { kind: "delayed-trigger", at: "end-of-combat", effect: { kind: "destroy", target: "trigger-object" }, text: "Destroy that creature." },
      resolve: null,
      text: T1,
    },
  ],
});
