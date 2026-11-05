import { defineCard } from "../define.js";

const TAP =
  "{T}: Tap target creature without flying that's attacking you. It doesn't untap during its controller's untap step for as long as this land remains tapped.";

export default defineCard({
  name: "Ice Floe",
  colors: [],
  types: ["land"],
  text: `You may choose not to untap this land during your untap step.\n${TAP}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying", attackingYou: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: TAP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this land during your untap step.",
    },
  ],
});
