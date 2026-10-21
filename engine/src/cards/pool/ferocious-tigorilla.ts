import { defineCard } from "../define.js";

// EDHREC rank 11308. Ikoria: Lair of Behemoths.
//
// "Enters with your choice of" counter is a choice made as it enters (rule
// 614.1c): `chooseOnEnter`, asked before it moves, then the matching
// enters-with-counters replacement (Denry Klin's shape).

const ENTERS_TEXT =
  "This creature enters with your choice of a trample counter or a menace counter on it. (A creature with menace can't be blocked except by two or more creatures.)";

const entersWith = (choice: string) =>
  ({
    affects: { scope: "self" },
    condition: { kind: "chosen-on-enter", value: choice },
    replacement: { event: "enters-battlefield", counters: { kind: choice, amount: 1 } },
    text: ENTERS_TEXT,
  }) as const;

export default defineCard({
  name: "Ferocious Tigorilla",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat", "Ape"],
  power: 4,
  toughness: 3,
  text: ENTERS_TEXT,
  chooseOnEnter: ["trample", "menace"],
  static: [entersWith("trample"), entersWith("menace")],
});
