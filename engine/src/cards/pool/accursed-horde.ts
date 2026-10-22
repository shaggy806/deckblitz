import { defineCard } from "../define.js";

// Rulings:
//   [2017-07-14] Accursed Horde's ability can target itself while it's attacking.
//   [2017-07-14] The target Zombie gains indestructible for the rest of the turn, even after it
//     stops being an attacking creature.

export default defineCard({
  name: "Accursed Horde",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  text: "{1}{B}: Target attacking Zombie gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it. If its toughness is 0 or less, it still dies.)",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Zombie", attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{B}: Target attacking Zombie gains indestructible until end of turn.",
    },
  ],
});
