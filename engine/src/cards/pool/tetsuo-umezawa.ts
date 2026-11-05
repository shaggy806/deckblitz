import { defineCard } from "../define.js";

export default defineCard({
  name: "Tetsuo Umezawa",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 3,
  toughness: 3,
  text: "Tetsuo Umezawa can't be the target of Aura spells.\n{U}{B}{B}{R}, {T}: Destroy target tapped or blocking creature.",
  activated: [
    {
      cost: { mana: "{U}{B}{B}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ tapped: true }, { blocking: true }] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{U}{B}{B}{R}, {T}: Destroy target tapped or blocking creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { filter: { subtype: "Aura" }, spellsOnly: true, anyController: true, notHexproof: true },
      text: "Tetsuo Umezawa can't be the target of Aura spells.",
    },
  ],
});
