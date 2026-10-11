import { defineCard } from "../define.js";

// EDHREC rank 6875.
//
// Rulings:
//   [2020-04-17] You can spend the two colorless mana produced by Cryptic Trilobite on two
//     different activated abilities.
//   [2020-04-17] A mana cost of {X}{X} means that you pay twice X. If you want X to be 3, you pay
//     {6} to cast Cryptic Trilobite.
//
// "Only to activate abilities" is Omen Hawker's restriction: an `abilityOf`
// over any source in any zone and no `spell`, stamped on each of the two
// units separately, so they can pay for two different abilities.

const ENTER_TEXT = "This creature enters with X +1/+1 counters on it.";
const MANA_TEXT =
  "Remove a +1/+1 counter from this creature: Add {C}{C}. Spend this mana only to activate abilities.";
const GROW_TEXT = "{1}, {T}: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Cryptic Trilobite",
  manaCost: "{X}{X}",
  colors: [],
  types: ["creature"],
  subtypes: ["Trilobite"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${MANA_TEXT}\n${GROW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
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
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
