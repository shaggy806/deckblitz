import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] Marshland Bloodcaster's ability affects the next spell you cast after the ability
//     has resolved. If you cast any spells in response to the ability, those spells are cast as
//     normal.
//   [2021-04-16] If the next spell you cast has {X} in its mana cost, you must choose 0 as the value
//     of X if you pay life rather than pay its mana cost.
//   [2021-04-16] Even after the ability resolves, you may choose to not pay life rather than pay
//     mana cost of the next spell you cast that turn. However, if you do this, you won't have the
//     opportunity to pay life for any other spells you cast that turn (unless you activate the
//     ability again).
//   [2021-04-16] If you cast a spell for another cost "rather than pay its mana cost," you can't
//     choose to cast it for any alternative costs. You can, however, pay additional costs. If the
//     card has any mandatory additional costs, such as that of Draconic Intervention, those must
//     be paid to cast the card.

export default defineCard({
  name: "Marshland Bloodcaster",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\n{1}{B}, {T}: Rather than pay the mana cost of the next spell you cast this turn, you may pay life equal to that spell's mana value.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, payLifeManaValue: true },
      resolve: null,
      text: "{1}{B}, {T}: Rather than pay the mana cost of the next spell you cast this turn, you may pay life equal to that spell's mana value.",
    },
  ],
});
