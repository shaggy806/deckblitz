import { defineCard } from "../define.js";

// EDHREC rank 19574.
//
// The stun counter is part of the cost (put on as it's paid), and X is her
// power as the ability resolves — as she last existed on the battlefield if
// she has left by then.
const EXILE_TEXT =
  "{T}, Put a stun counter on Jessica Jones: Exile the top X cards of your library, where X is Jessica Jones's power. You may play those cards this turn.";

export default defineCard({
  name: "Jessica Jones, Private Eye",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective", "Hero"],
  power: 2,
  toughness: 3,
  text: `${EXILE_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  activated: [
    {
      cost: { mana: null, tap: true, addCounter: { kind: "stun", count: 1 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: { powerOf: "source" }, duration: "end-of-turn" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
