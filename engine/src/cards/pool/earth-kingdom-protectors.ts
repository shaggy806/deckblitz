import { defineCard } from "../define.js";

// EDHREC rank 9488. Selfless Savior's shape, narrowed to Allies.
export default defineCard({
  name: "Earth Kingdom Protectors",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: "Vigilance\nSacrifice this creature: Another target Ally you control gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Ally" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice this creature: Another target Ally you control gains indestructible until end of turn.",
    },
  ],
});
