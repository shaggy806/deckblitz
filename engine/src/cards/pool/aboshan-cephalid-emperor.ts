import { defineCard } from "../define.js";

// Aboshan is an Octopus, so it may tap itself for the first ability (no {T}
// in the cost, so summoning sickness doesn't stop it — rule 302.6).
export default defineCard({
  name: "Aboshan, Cephalid Emperor",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Octopus", "Noble"],
  power: 3,
  toughness: 3,
  text: "Tap an untapped Octopus you control: Tap target permanent.\n{U}{U}{U}: Tap all creatures without flying.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Octopus", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["permanent"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Tap an untapped Octopus you control: Tap target permanent.",
    },
    {
      cost: { mana: "{U}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", notKeyword: "flying" } },
      resolve: null,
      text: "{U}{U}{U}: Tap all creatures without flying.",
    },
  ],
});
