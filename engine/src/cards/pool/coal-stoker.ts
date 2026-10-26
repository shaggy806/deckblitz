import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 19508.
//
// An intervening-if on how it entered (Patched Plaything's filter): cast, by
// you, from your hand. A token copy wasn't cast (the ruling). Not a mana
// ability — it uses the stack.
//
// Rulings:
//   [2022-12-08] If a token is created that's a copy of Coal Stoker, the token wasn't cast, and
//     Coal Stoker's ability won't trigger. Similarly, if an effect copies Coal Stoker while it's
//     on the stack, the copy becomes a token, but the copy was created on the stack and not cast
//     from your hand, so the ability won't trigger in that case either.
//   [2022-12-08] Coal Stoker's ability isn't a mana ability. It uses the stack and can be
//     responded to.
//   [2022-12-08] If a nontoken creature enters the battlefield as a copy of this creature, the
//     copy's enters-the-battlefield ability will still trigger as long as you cast the spell that
//     became that nontoken creature from your hand.

const TEXT = "When this creature enters, if you cast it from your hand, add {R}{R}{R}.";

export default defineCard({
  name: "Coal Stoker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
