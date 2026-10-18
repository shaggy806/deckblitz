import { defineCard } from "../define.js";

// Restless Vinestalk's attack trigger: the base 5/5 is a layer-7b
// characteristic-setting effect from its timestamp, so counters and pumps
// still apply on top (the rulings).
//
// Rulings:
//   [2023-04-14] Chrome Host Hulk's ability overwrites all previous effects that set the affected
//     creatures' power and/or toughness to specific values. Other effects that set these
//     characteristics to specific values that start to apply after the ability resolves will
//     overwrite that part of the effect.
//   [2023-04-14] Effects that modify the affected creature's power or toughness without setting it
//     will apply no matter when they started to take effect. The same is true for counters that
//     change the creature's power or toughness.

const ATTACK_TEXT =
  "Whenever this creature attacks, up to one other target creature has base power and toughness 5/5 until end of turn.";

export default defineCard({
  name: "Chrome Host Hulk",
  art: "https://cards.scryfall.io/art_crop/back/7/0/70b2cdc5-35b9-443d-b499-c8b75c0d0a64.jpg",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Troll"],
  power: 5,
  toughness: 5,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Gnottvold Hermit", "Chrome Host Hulk"],
  transform: true,
});
