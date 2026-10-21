import { defineCard } from "../define.js";

// EDHREC rank 14921. Ikoria: Lair of Behemoths.
//
// "Enters with your choice of two different counters" is a choice made as it
// enters (rule 614.1c): `chooseOnEnter` over the three pairs of different
// kinds, asked before it moves, then the two enters-with-counters
// replacements of the chosen pair (Denry Klin's shape). Each is a keyword
// counter (rule 122.1b).
const TEXT =
  "This creature enters with your choice of two different counters on it from among menace, deathtouch, and lifelink.";

const PAIRS = [
  ["menace and deathtouch", "menace", "deathtouch"],
  ["menace and lifelink", "menace", "lifelink"],
  ["deathtouch and lifelink", "deathtouch", "lifelink"],
] as const;

const entersWith = (choice: string, kind: string) =>
  ({
    affects: { scope: "self" },
    condition: { kind: "chosen-on-enter", value: choice },
    replacement: { event: "enters-battlefield", counters: { kind, amount: 1 } },
    text: TEXT,
  }) as const;

export default defineCard({
  name: "Grimdancer",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 3,
  toughness: 3,
  text: TEXT,
  chooseOnEnter: PAIRS.map(([choice]) => choice),
  static: PAIRS.flatMap(([choice, first, second]) => [entersWith(choice, first), entersWith(choice, second)]),
});
