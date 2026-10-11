import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

/**
 * Vraska, Soul of Stone's token: a 1/1 colorless Sculpture Treasure artifact
 * creature (Sculpture is a creature type, Treasure an artifact type — the
 * ruling) with the Treasure's mana ability. As a creature its {T} ability
 * waits out summoning sickness (rule 302.6).
 */
export default defineCard({
  name: "Sculpture Treasure Token",
  art: "a0fec445-c6fb-4ca2-b63f-1d608c418a22",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Sculpture", "Treasure"],
  power: 1,
  toughness: 1,
  text: "{T}, Sacrifice this token: Add one mana of any color.",
  activated: [
    addManaAbility({
      mana: "any-color",
      sacrifice: "self",
      text: "{T}, Sacrifice this token: Add one mana of any color.",
    }),
  ],
});
