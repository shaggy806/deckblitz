import { defineCard } from "../define.js";

// EDHREC rank 24612.
//
// Rulings:
//   [2017-07-14] Its abilities can target itself while it's attacking.
//   [2017-07-14] The Zombie keeps lifelink or deathtouch after combat, until end of turn.

export default defineCard({
  name: "Unraveling Mummy",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: "{1}{W}: Target attacking Zombie gains lifelink until end of turn.\n{1}{B}: Target attacking Zombie gains deathtouch until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Zombie", attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: Target attacking Zombie gains lifelink until end of turn.",
    },
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Zombie", attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{B}: Target attacking Zombie gains deathtouch until end of turn.",
    },
  ],
});
