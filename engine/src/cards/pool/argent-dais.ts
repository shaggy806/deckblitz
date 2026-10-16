import { defineCard } from "../define.js";

// EDHREC rank 8991. Modern Horizons 3.
//
// "Whenever two or more creatures attack" is any player's attack (the second
// ruling): an `attack-with` of `who: "any"`, once per declaration. "Its
// controller draws two cards": the exiled permanent's controller as it left —
// King Solomon's Frogs' per-player `thisWay`, twice over. A legal target is
// always exiled (a commander goes to exile and only then, as a state-based
// action, to the command zone — rule 903.9a), and an illegal one stops the
// whole ability, so nobody draws (the first ruling).
//
// Rulings:
//   [2024-06-07] If the target nonland permanent is illegal as Argent Dais's last ability tries to
//     resolve, it won't resolve and none of its effects will happen. No player will draw cards.
//   [2024-06-07] Argent Dais's second ability triggers whenever two or more creatures attack, not
//     just when you attack with two or more creatures.

const OIL_TEXT = "This artifact enters with two oil counters on it.";
const ATTACK_TEXT = "Whenever two or more creatures attack, put an oil counter on this artifact.";
const EXILE_TEXT =
  "{2}, {T}, Remove two oil counters from this artifact: Exile another target nonland permanent. Its controller draws two cards.";

export default defineCard({
  name: "Argent Dais",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${OIL_TEXT}\n${ATTACK_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: OIL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "any", atLeast: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "oil", count: 2 } },
      targets: [{ kind: "other", of: "nonland-permanent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "draw",
            who: "each-player",
            amount: { product: [2, { thisWay: "exiled", who: "each" }] },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
