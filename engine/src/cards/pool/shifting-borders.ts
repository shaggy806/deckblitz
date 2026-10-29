import { defineCard } from "../define.js";

// EDHREC rank 18775. Switcheroo's exchange over two lands (rule 701.12b: if
// either is an illegal target as it resolves, no exchange — the ruling);
// splice as Evermind.

export default defineCard({
  name: "Shifting Borders",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{3}{U}" },
  text: "Exchange control of two target lands.\nSplice onto Arcane {3}{U} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["land", { kind: "other", of: "land", than: { slot: 0 } }],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
