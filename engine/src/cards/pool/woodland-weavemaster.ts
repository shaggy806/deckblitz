import { defineCard } from "../define.js";

// EDHREC rank 13132.
//
// Rulings:
//   [2026-06-29] Woodland Weavemaster's last ability is a mana ability. It doesn't use the stack
//     and can't be responded to.
//
// "Elf sources" reach past the battlefield (rule 109.2a): an Elf card's
// ability in a hand or graveyard may be paid with this mana too.
const PUMP_TEXT = "Whenever another Elf you control enters, this creature gets +1/+1 until end of turn.";
const SPEND_TEXT = "Spend this mana only to cast Elf spells and activate abilities of Elf sources.";
const MANA_TEXT = `{T}: Add X mana of any one color, where X is this creature's power. ${SPEND_TEXT}`;

export default defineCard({
  name: "Woodland Weavemaster",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${PUMP_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Elf" }, otherOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { powerOf: "source" },
        spendOnly: {
          spell: { subtype: "Elf" },
          abilityOf: { subtype: "Elf" },
          abilityOfAnyZone: true,
          text: SPEND_TEXT,
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
