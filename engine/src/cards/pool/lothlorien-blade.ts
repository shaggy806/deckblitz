import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9309.

export default defineCard({
  name: "Lothlórien Blade",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Whenever equipped creature attacks, it deals damage equal to its power to target creature defending player controls.\nEquip Elf {2}\nEquip {5}",
  // "Defending player" is the attack trigger's player (Thunder Lasso's
  // shape): the Equipment itself isn't attacking. The equipped creature
  // deals the damage, at its power as the ability resolves — as it last
  // existed if it has left.
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
      resolve: null,
      text: "Whenever equipped creature attacks, it deals damage equal to its power to target creature defending player controls.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Elf" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Elf {2}",
      sorcerySpeed: true,
    },
    equip("{5}"),
  ],
});
