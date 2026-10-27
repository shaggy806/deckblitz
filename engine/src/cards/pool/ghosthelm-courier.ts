import { defineCard } from "../define.js";

const PUMP_TEXT =
  "{2}{U}, {T}: Target Wizard creature gets +2/+2 and has shroud for as long as this creature remains tapped. (It can't be the target of spells or abilities.)";

// Once applied, the effect stays even if the target stops being a Wizard (the
// ruling).
export default defineCard({
  name: "Ghosthelm Courier",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: `You may choose not to untap this creature during your untap step.\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Wizard" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "while-source-tapped" },
          { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "while-source-tapped" },
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
