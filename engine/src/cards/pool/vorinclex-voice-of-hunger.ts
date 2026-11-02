import { defineCard } from "../define.js";

// Kaldheim. The first trigger is a triggered mana ability
// (rule 605.1b), as Mirari's Wake's is. The second makes no mana, so it uses the
// stack: the land is its trigger object, and "its controller's next untap step"
// follows the land.

const MANA_TEXT = "Whenever you tap a land for mana, add one mana of any type that land produced.";
const FREEZE_TEXT = "Whenever an opponent taps a land for mana, that land doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Vorinclex, Voice of Hunger",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${MANA_TEXT}\n${FREEZE_TEXT}`,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-mana", mana: "produced", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      trigger: { on: "tapped-for-mana", who: "opponent", filter: { type: "land" } },
      targets: [],
      effect: { kind: "tap", target: "trigger-object", doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: FREEZE_TEXT,
    },
  ],
});
