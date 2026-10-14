import { defineCard } from "../define.js";

// "You may change the target of target instant or sorcery spell with a single
// target to this creature": only to Hydroelectric Specimen, and only if it's
// a legal target for that spell (rule 115.7a); keeping it is a choice.
export default defineCard({
  name: "Hydroelectric Specimen",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 1,
  toughness: 4,
  keywords: ["flash"],
  text:
    "Flash\n" +
    "When this creature enters, you may change the target of target instant or sorcery spell with a single target to this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "stack", spells: "instant-or-sorcery", abilities: false, singleTarget: true }],
      effect: { kind: "change-targets", target: 0, how: "change", to: "source", optional: true },
      resolve: null,
      text: "When this creature enters, you may change the target of target instant or sorcery spell with a single target to this creature.",
    },
  ],
  faces: ["Hydroelectric Specimen", "Hydroelectric Laboratory"],
});
