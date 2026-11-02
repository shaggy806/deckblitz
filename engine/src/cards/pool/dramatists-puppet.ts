import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, for each kind of counter on target permanent, put another counter of that kind on it or remove one from it.";

export default defineCard({
  name: "Dramatist's Puppet",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 4,
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
