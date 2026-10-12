import { defineCard } from "../define.js";

// EDHREC rank 8078.
//
// Base power is read off each source as it deals the damage (a +1/+1
// counter doesn't change it — the rulings). Once per player dealt damage by
// one or more of them in one damage event; the token's counters are the
// total those creatures dealt that player.
const ENTERS_TEXT = "Primo enters with twice X +1/+1 counters on it.";
const DAMAGE_TEXT =
  "Whenever one or more creatures you control with base power 0 deal combat damage to a player, create a 0/0 " +
  "green and blue Fractal creature token. Put a number of +1/+1 counters on it equal to the damage dealt.";

export default defineCard({
  name: "Primo, the Unbounded",
  manaCost: "{X}{G}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fractal", "Wolf"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { product: ["x", 2] } } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", basePower: { op: "eq", n: 0 } },
        to: "player",
        combat: true,
      },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Fractal Token",
        count: 1,
        thenCounters: { kind: "+1/+1", amount: { triggerValue: true } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
