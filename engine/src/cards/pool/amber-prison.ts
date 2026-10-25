import { defineCard } from "../define.js";

// Mirage. EDHREC rank 23456.

const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";
const TAP_TEXT =
  "{4}, {T}: Tap target artifact, creature, or land. That permanent doesn't untap during its controller's untap step for as long as this artifact remains tapped.";

export default defineCard({
  name: "Amber Prison",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${UNTAP_TEXT}\n${TAP_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
