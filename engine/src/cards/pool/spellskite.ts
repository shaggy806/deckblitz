import { defineCard } from "../define.js";

// "Change a target … to this creature" (rule 115.7b): one target of the
// spell or ability becomes Spellskite, if Spellskite is a legal target for
// it — chosen when it could be more than one of them — or nothing happens.
export default defineCard({
  name: "Spellskite",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 0,
  toughness: 4,
  text: "{U/P}: Change a target of target spell or ability to this creature. ({U/P} can be paid with either {U} or 2 life.)",
  activated: [
    {
      cost: { mana: "{U/P}", tap: false },
      targets: [{ kind: "stack", spells: "any", abilities: true }],
      effect: { kind: "change-targets", target: 0, how: "change-one", to: "source" },
      resolve: null,
      text: "{U/P}: Change a target of target spell or ability to this creature.",
    },
  ],
});
