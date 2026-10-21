import { defineCard } from "../define.js";

const ENTERS_TEXT = "This creature enters with your choice of a flying counter or a hexproof counter on it.";

const entersWith = (choice: string) =>
  ({
    affects: { scope: "self" },
    condition: { kind: "chosen-on-enter", value: choice },
    replacement: { event: "enters-battlefield", counters: { kind: choice, amount: 1 } },
    text: ENTERS_TEXT,
  }) as const;

export default defineCard({
  name: "Wingfold Pteron",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 6,
  text: `${ENTERS_TEXT} (A creature with hexproof can't be the target of spells or abilities your opponents control.)`,
  chooseOnEnter: ["flying", "hexproof"],
  static: [entersWith("flying"), entersWith("hexproof")],
});
