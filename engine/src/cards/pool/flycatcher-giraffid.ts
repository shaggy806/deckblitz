import { defineCard } from "../define.js";

const ENTERS_TEXT = "This creature enters with your choice of a reach counter or a vigilance counter on it.";

const entersWith = (choice: string) =>
  ({
    affects: { scope: "self" },
    condition: { kind: "chosen-on-enter", value: choice },
    replacement: { event: "enters-battlefield", counters: { kind: choice, amount: 1 } },
    text: ENTERS_TEXT,
  }) as const;

export default defineCard({
  name: "Flycatcher Giraffid",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Antelope", "Lizard"],
  power: 3,
  toughness: 5,
  text: ENTERS_TEXT,
  chooseOnEnter: ["reach", "vigilance"],
  static: [entersWith("reach"), entersWith("vigilance")],
});
