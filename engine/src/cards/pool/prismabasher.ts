import { defineCard } from "../define.js";

const VIVID_TEXT =
  "Vivid — When this creature enters, up to X target creatures you control get +X/+X until end of turn, where X is the number of colors among permanents you control.";

// X is read twice (the second ruling): as the trigger goes on the stack, for
// the group's bound, and again as it resolves, for the bonus.
const X = { colorsAmong: { controlledBy: "you" } } as const;

export default defineCard({
  name: "Prismabasher",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${VIVID_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature-you-control", max: X }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
      },
      resolve: null,
      text: VIVID_TEXT,
    },
  ],
});
