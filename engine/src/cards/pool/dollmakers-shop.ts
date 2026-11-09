import { defineCard } from "../define.js";

// Dollmaker's Shop // Porcelain Gallery's left door. Once per player attacked
// by a non-Toy (the ruling), and only declared attackers count.
const TEXT = "Whenever one or more non-Toy creatures you control attack a player, create a 1/1 white Toy artifact creature token.";

export default defineCard({
  name: "Dollmaker's Shop",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${TEXT}\n(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any", filter: { type: "creature", notSubtypes: ["Toy"] } },
      targets: [],
      effect: { kind: "create-token", token: "Toy Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
