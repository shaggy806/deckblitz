import { defineCard } from "../define.js";

// Aetherdrift (DFT). EDHREC rank 11636.
//
// Rulings:
//   [2025-02-07] Pit Automaton has received an update to its Oracle text. Specifically, the
//     delayed triggered ability doesn’t trigger if you activate an exhaust ability that is also a
//     mana ability.
//   [2025-02-07] If an ability triggers whenever you activate an exhaust ability, that ability
//     resolves before the exhaust ability resolves.
//   [2025-02-07] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.
//   [2025-02-07] Exhaust abilities can be activated any time you could normally activate an
//     ability.
//
// The second ability sets up a delayed triggered ability (rule 603.7) that watches its
// controller's next exhaust ability (rule 702.177) this turn — Jaya's Phoenix's shape, `once`
// (603.7b) — and lapses as the turn ends. `activates-ability` without `orMana` never sees a mana
// ability, so an exhaust mana ability neither fires it nor uses it up (the first ruling). The
// copy goes on the stack above the ability and resolves first; the ability's source is its
// source, and it pays no cost (rule 707.10).

const MANA_TEXT = "{T}: Add {C}{C}. Spend this mana only to activate abilities.";
const COPY_TEXT =
  "{2}, {T}: When you next activate an exhaust ability that isn't a mana ability this turn, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Pit Automaton",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${MANA_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: { abilityOf: {}, abilityOfAnyZone: true, text: "Spend this mana only to activate abilities." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "activates-ability", who: "you", exhaust: true }, once: true },
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
        text: "Copy that ability. You may choose new targets for the copy.",
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
