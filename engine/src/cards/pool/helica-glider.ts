import { defineCard } from "../define.js";

// EDHREC rank 26562. Ikoria: Lair of Behemoths.
//
// "Enters with your choice of" counter is a choice made as it enters (rule
// 614.1c): `chooseOnEnter`, asked before it moves, then the matching
// enters-with-counters replacement (Denry Klin's shape).

const ENTERS_TEXT = "This creature enters with your choice of a flying counter or a first strike counter on it.";

const entersWith = (choice: string, kind: string) =>
  ({
    affects: { scope: "self" },
    condition: { kind: "chosen-on-enter", value: choice },
    replacement: { event: "enters-battlefield", counters: { kind, amount: 1 } },
    text: ENTERS_TEXT,
  }) as const;

export default defineCard({
  name: "Helica Glider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Nightmare", "Squirrel"],
  power: 2,
  toughness: 2,
  text: ENTERS_TEXT,
  chooseOnEnter: ["flying", "first strike"],
  static: [entersWith("flying", "flying"), entersWith("first strike", "first-strike")],
});
