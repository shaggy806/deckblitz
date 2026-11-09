import { defineCard } from "../define.js";

const TEXT = "Whenever this creature blocks or becomes blocked by a creature, destroy all Auras attached to that creature.";
const DESTROY = { kind: "destroy-all", filter: { subtype: "Aura", attachedToObject: "trigger-object" } } as const;

export default defineCard({
  name: "Treefolk Mystic",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self", object: "blocked" }, targets: [], effect: DESTROY, resolve: null, text: TEXT },
    { trigger: { on: "blocked-by", who: "self" }, targets: [], effect: DESTROY, resolve: null, text: TEXT },
  ],
});
