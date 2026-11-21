import { defineCard } from "../define.js";

// EDHREC rank 18374.
//
// "When you do": the reflexive ability triggers once for each +1/+1 counter
// actually put on it this way (the Doubling Season ruling) — `times` over
// `thisWay: "counters-placed"`, Craig Boone's shape — and never if none went
// on. Its target is chosen as it goes on the stack (rule 603.12). Which
// counter comes off is its controller's choice (the ruling): `remove-counters`
// with `counter: "any"`, off a permanent or an opponent's own counters.

const REFLEXIVE_TEXT = "When you do, you may remove a counter from another target permanent or opponent.";
const DAMAGE_TEXT = `Whenever this creature deals combat damage to a player, put a +1/+1 counter on it. ${REFLEXIVE_TEXT}`;

export default defineCard({
  name: "Etched Slith",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Slith"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "reflexive-trigger",
            times: { thisWay: "counters-placed" },
            targets: [{ kind: "other", of: { kind: "permanent", filter: {}, orPlayer: "opponent" } }],
            effect: { kind: "remove-counters", target: 0, counter: "any", count: 1, upTo: true },
            text: REFLEXIVE_TEXT,
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
