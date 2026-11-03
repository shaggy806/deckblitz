import { defineCard } from "../define.js";

// EDHREC rank 4214.
//
// Rulings:
//   [2022-10-14] Blast-Furnace Hellkite’s last ability applies to any creature that is attacking
//     one of your opponents, even if another opponent controls that creature.
//   [2022-10-14] When you cast a spell with offering by sacrificing a permanent, generic mana in
//     the sacrificed permanent’s mana cost reduces only generic mana in the spell’s total cost.
//     Colored and colorless mana in the sacrificed permanent’s mana cost reduces mana of the same
//     type in spell’s total cost, and any excess reduces the spell’s total cost by that much
//     generic mana. The total cost of the spell can’t be reduced to less than {0}.

export default defineCard({
  name: "Blast-Furnace Hellkite",
  manaCost: "{7}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "double-strike"],
  kicker: { cost: "", keyword: "offering", flash: true, offering: { type: "artifact" } },
  text: "Artifact offering (You may cast this spell as though it had flash by sacrificing an artifact and paying the difference in mana costs between this and the sacrificed artifact. Mana cost includes color.)\nFlying, double strike\nCreatures attacking your opponents have double strike.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attackingOpponent: true } },
      grantKeywords: ["double-strike"],
      text: "Creatures attacking your opponents have double strike.",
    },
  ],
});
