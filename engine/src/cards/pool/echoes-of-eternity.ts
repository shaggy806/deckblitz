import { defineCard } from "../define.js";

// EDHREC rank 1469.
//
// Rulings:
//   If you control two copies of Echoes of Eternity, abilities of colorless spells and other
//     colorless permanents you control trigger three times.
//   If you control two copies of Echoes of Eternity and you cast a colorless spell, each of their
//     second abilities will trigger. Then, each of their first abilities will cause the other's
//     second ability to trigger an additional time. In total, you'll get four copies.
//   Echoes of Eternity's first ability doesn't copy the triggered ability; it just causes the
//     ability to trigger an additional time. Any choices made as you put the ability onto the stack,
//     such as modes and targets, are made separately for each instance.
//   The copy created by Echoes of Eternity's last ability is put directly onto the stack. It isn't
//     cast, so any abilities that apply "when you cast [this spell]" won't trigger.
const DOUBLE =
  "If a triggered ability of a colorless spell you control or another colorless permanent you control triggers, that ability triggers an additional time.";
const COPY = "Whenever you cast a colorless spell, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Echoes of Eternity",
  manaCost: "{3}{C}{C}{C}",
  types: ["kindred", "enchantment"],
  subtypes: ["Eldrazi"],
  text: `${DOUBLE}\n${COPY} (A copy of a permanent spell becomes a token.)`,
  static: [
    {
      affects: { scope: "self" },
      doubleTriggersOf: { filter: { colorless: true, controlledBy: "you" }, others: true, spells: true },
      text: DOUBLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colorless: true } },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: COPY,
    },
  ],
});
