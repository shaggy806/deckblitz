import { defineCard } from "../define.js";

// EDHREC rank 3110.
//
// Its mana ability isn't one: it targets (rule 605.5a) and its cost mills
// (605.1a), so it uses the stack, and the colour is chosen by its controller as
// it resolves (608.2d) — the target player adds it (`add-mana`'s `target`).
//
// Rulings:
//   [2025-06-06] As The Warring Triad enters the battlefield, the number of cards in your
//     graveyard will determine whether any replacement effects that affect creatures entering the
//     battlefield apply to The Warring Triad.
//   [2025-06-06] If The Warring Triad is attacking or blocking and it stops being a creature, it
//     will be removed from combat. It won't rejoin combat if it resumes being a creature later
//     during that combat.
//   [2025-06-06] Counters put on The Warring Triad remain on it while it's not a creature, even if
//     they have no effect.
//   [2025-06-06] The Warring Triad's last ability isn't a mana ability. It uses the stack and can
//     be responded to.
//   [2025-06-06] The Warring Triad's abilities function while it's on the battlefield, regardless
//     of whether it's a creature.
//   [2025-06-06] The type-changing ability that can make The Warring Triad not be a creature
//     functions only on the battlefield. It's always a creature card in other zones, regardless of
//     how many cards are in your graveyard. It's always a creature spell while it's on the stack.
//   [2025-06-06] If The Warring Triad stops being a creature, it loses the type creature and the
//     creature type God. It continues to be a legendary artifact.
//   [2025-06-06] If an effect causes The Warring Triad to lose all abilities, its ability that
//     causes it to stop being a creature still applies if appropriate.
//   [2025-06-06] When The Warring Triad enters the battlefield, the number of cards in your
//     graveyard will determine if a creature entered the battlefield or not for abilities that
//     trigger whenever a creature enters the battlefield.

export default defineCard({
  name: "The Warring Triad",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample", "haste"],
  text: "Flying, trample, haste\nAs long as there are fewer than eight cards in your graveyard, The Warring Triad isn't a creature.\n{T}, Mill a card: Target player adds one mana of any color. (Activate only as an instant.)",
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "mill", target: "you", amount: 1 } },
      targets: ["player"],
      effect: { kind: "add-mana", mana: "any-color", amount: 1, target: 0 },
      resolve: null,
      text: "{T}, Mill a card: Target player adds one mana of any color. (Activate only as an instant.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 8 } },
      removeTypes: ["creature"],
      text: "As long as there are fewer than eight cards in your graveyard, The Warring Triad isn't a creature.",
    },
  ],
});
