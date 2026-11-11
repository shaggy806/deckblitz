import { defineCard } from "../define.js";

// Tales of Middle-earth Commander (LTC). Flashback's X is announced for the
// cast though its mana has none (rule 107.3a): the cards exiled from the
// graveyard (never this one), and the X the spell then reads.
//
// Rulings:
//   [2023-06-16] If you want to cast one of the milled cards, you cast it as part of the
//     resolution of Summons of Saruman. You can't wait to cast the spell later in the turn.
//     Timing permissions based on the card's type are ignored.
//   [2023-06-16] If you cast a spell "without paying its mana cost", you can't choose to cast it
//     for any alternative costs. You can, however, pay additional costs, such as kicker costs.
//   [2023-06-16] If the spell has {X} in its mana cost, you must choose 0 as the value of X.
export default defineCard({
  name: "Summons of Saruman",
  manaCost: "{X}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Amass Orcs X. Mill X cards. You may cast an instant or sorcery spell with mana value X or less from among them without paying its mana cost. (To amass Orcs X, put X +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)\nFlashback—{3}{U}{R}, Exile X cards from your graveyard.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "amass", amount: "x", creatureType: "Orc" },
      { kind: "mill", target: "you", amount: "x" },
      {
        kind: "cast-now",
        from: "milled-this-way",
        free: true,
        spell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: { amount: "x" } } },
      },
    ],
  },
  flashback: { cost: "{3}{U}{R}", exileFromGraveyard: { count: "x" } },
});
