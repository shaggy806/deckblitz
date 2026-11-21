import { defineCard } from "../define.js";

// EDHREC rank 20587.
//
// Polukranos, Unchained's prevention (a `self-counters` condition, `prevent` with
// `perEvent`, `then` removing "x" +1/+1 counters — rule 615.5), its `then` also making
// Phyrexian Vindicator's reflexive trigger, its value "x", the damage that would have
// been dealt — "that much damage" even when it's more than the counters there were
// (the ruling). `thenCountsUnprevented`: damage that can't be prevented still
// removes the counters and triggers (rule 615.12).
//
// Rulings:
//   If an amount of damage would be dealt to Magma Pummeler greater than the number of
//     +1/+1 counters on it, all of that damage is prevented, and all of those counters are
//     removed. In most cases, this will result in Magma Pummeler having 0 toughness, so it
//     will be put into its owner's graveyard. Its reflexive triggered ability still
//     triggers and it will still deal that much damage to any target.

const ENTER_TEXT = "This creature enters with X +1/+1 counters on it.";
const REFLEXIVE_TEXT = "When one or more counters are removed from this creature this way, it deals that much damage to any target.";
const DAMAGE_TEXT = `If damage would be dealt to this creature while it has a +1/+1 counter on it, prevent that damage and remove that many +1/+1 counters from it. ${REFLEXIVE_TEXT}`;

export default defineCard({
  name: "Magma Pummeler",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      replacement: {
        event: "would-deal-damage",
        to: "self",
        instead: {
          prevent: true,
          perEvent: true,
          thenCountsUnprevented: true,
          then: {
            kind: "sequence",
            effects: [
              { kind: "remove-counter", target: "source", counter: "+1/+1", amount: "x" },
              {
                kind: "reflexive-trigger",
                targets: ["any-target"],
                value: "x",
                effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
                text: REFLEXIVE_TEXT,
              },
            ],
          },
        },
      },
      text: DAMAGE_TEXT,
    },
  ],
});
