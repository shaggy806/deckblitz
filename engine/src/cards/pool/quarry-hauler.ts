import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, for each kind of counter on target permanent, put another counter of that kind on it or remove one from it.";

export default defineCard({
  name: "Quarry Hauler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Camel"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: { kind: "another-counter-of-each-kind", target: 0, orRemove: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
