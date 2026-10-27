import { defineCard } from "../define.js";

const PUMP_TEXT =
  "{2}{G}, {T}: Target Elf creature gets +2/+2 and has trample for as long as this creature remains tapped.";

// Once applied, the effect stays even if the target stops being an Elf (the
// ruling).
export default defineCard({
  name: "Everglove Courier",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 1,
  text: `You may choose not to untap this creature during your untap step.\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Elf" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "while-source-tapped" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this creature during your untap step.",
    },
  ],
});
