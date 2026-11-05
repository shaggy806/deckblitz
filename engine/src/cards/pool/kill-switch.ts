import { defineCard } from "../define.js";

const TEXT =
  "{2}, {T}: Tap all other artifacts. They don't untap during their controllers' untap steps for as long as this artifact remains tapped.";

// Only the artifacts there as it resolves are held (its ruling): each gets
// Phyrexian Gremlins' "doesn't untap … for as long as this remains tapped".
export default defineCard({
  name: "Kill Switch",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "artifact" },
        exceptSource: true,
        simultaneous: true,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
