import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// A playtest card (Mystery Booster 2). "Elves and/or Dwarf spells": a spell
// that's an Elf, a Dwarf, or both. The lifelink reads the creature it's
// paired with ("that creature"), so a Dwarf partner gives both lifelink.

export default defineCard({
  name: "Tarelily, Lovestruck Archer",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 2,
  toughness: 3,
  text: "Elves and/or Dwarf spells you cast cost {1} less to cast.\nSoulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have reach. If that creature is a Dwarf, both creatures have lifelink.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtypes: ["Elf", "Dwarf"] }, reduceGeneric: 1, when: { caster: "you" } },
      text: "Elves and/or Dwarf spells you cast cost {1} less to cast.",
    },
    {
      affects: { scope: "paired" },
      grantKeywords: ["reach"],
      text: "As long as this creature is paired with another creature, both creatures have reach.",
    },
    {
      affects: { scope: "paired" },
      condition: { kind: "controls", filter: { pairedWithSource: true, subtype: "Dwarf" }, atLeast: 1 },
      grantKeywords: ["lifelink"],
      text: "If that creature is a Dwarf, both creatures have lifelink.",
    },
  ],
});
