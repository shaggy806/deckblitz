import { defineCard } from "../define.js";

// EDHREC rank 11236.
//
// Rulings:
//   [2025-04-04] A resolving copy of a permanent spell becomes a token. That token isn’t “created”
//     and won’t interact with abilities that care about tokens being created.
//   [2025-04-04] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2025-04-04] If you don’t want to cast the copy, you can choose not to; the copy ceases to
//     exist the next time state-based actions are checked.
//   [2025-04-04] If you cast a spell “without paying its mana cost,” you can’t choose to cast it
//     for any alternative costs. You can, however, pay additional costs, such as kicker costs. If
//     the spell has any mandatory additional costs, those must be paid to cast the spell.
//   [2025-04-04] You cast the copy while Shiko’s last ability is resolving and still on the stack.
//     You can’t wait to cast it later in the turn.

const ETB_TEXT =
  "When Shiko enters, exile target nonland card with mana value 3 or less from your graveyard. Copy it, then you may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Shiko, Paragon of the Way",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Dragon"],
  power: 4,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ETB_TEXT} (A copy of a permanent spell becomes a token.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { notTypes: ["land"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      // Narset, Enlightened Exile's shape: exile it, then cast a copy of it
      // free or decline.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
