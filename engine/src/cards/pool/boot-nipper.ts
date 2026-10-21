import { defineCard } from "../define.js";

// EDHREC rank 22013. Ikoria: Lair of Behemoths.
//
// "Enters with your choice of" counter is a choice made as it enters (rule
// 614.1c): `chooseOnEnter`, asked before it moves, then the one matching
// enters-with-counters replacement (Denry Klin's shape).
const TEXT = "This creature enters with your choice of a deathtouch counter or a lifelink counter on it.";

const entersWith = (counter: "deathtouch" | "lifelink") =>
  ({
    affects: { scope: "self" },
    condition: { kind: "chosen-on-enter", value: counter },
    replacement: { event: "enters-battlefield", counters: { kind: counter, amount: 1 } },
    text: TEXT,
  }) as const;

export default defineCard({
  name: "Boot Nipper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 1,
  text: TEXT,
  chooseOnEnter: ["deathtouch", "lifelink"],
  static: [entersWith("deathtouch"), entersWith("lifelink")],
});
