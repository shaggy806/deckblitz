import { defineCard } from "../define.js";

// EDHREC rank 14821.
//
// "That card" is the creature sacrificed in answer, found in the graveyard it was
// just put into (rule 400.7j): `each-player-may` hands it to `ifDid` as its
// `{ paid: "sacrificed" }`. A token sacrificed this way can't come back (rule
// 111.8), but you were still the one who sacrificed, so you become the monarch.

const PREVENT_TEXT = "If a source an opponent controls would deal damage to you, prevent 1 of that damage.";
const ACTIVATED_TEXT =
  "{2}, {T}, Sacrifice this artifact: You may sacrifice a creature. If you do, return that card to the battlefield under its owner's control with three +1/+1 counters on it and you become the monarch.";

export default defineCard({
  name: "Heart-Shaped Herb",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${PREVENT_TEXT}\n${ACTIVATED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", source: { controlledBy: "opponent" }, instead: { prevent: 1 } },
      text: PREVENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "sequence",
          effects: [
            {
              kind: "put-onto-battlefield",
              target: { paid: "sacrificed" },
              withCounters: { kind: "+1/+1", amount: 3 },
            },
            { kind: "become-monarch" },
          ],
        },
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
