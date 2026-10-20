import { defineCard } from "../define.js";

// EDHREC rank 7274.

export default defineCard({
  name: "Selfless Samurai",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 2,
  toughness: 2,
  text: "Whenever a Samurai or Warrior you control attacks alone, it gains lifelink until end of turn.\nSacrifice this creature: Another target creature you control gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice this creature: Another target creature you control gains indestructible until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, it gains lifelink until end of turn.",
    },
  ],
});
