import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Creatures you control get +1/+1.";
const ENTER_TEXT =
  "When this enchantment enters, return up to X target creature cards from your graveyard to the battlefield, where X is the number of times this enchantment was kicked.";

// The enters ability's group is bounded by how many times the permanent was
// kicked, read as the trigger goes on the stack (0 when it wasn't cast).
export default defineCard({
  name: "Marshal's Anthem",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Multikicker {1}{W} (You may pay an additional {1}{W} any number of times as you cast this spell.)\n${ANTHEM_TEXT}\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{W}", multi: true },
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: ANTHEM_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          max: { timesKicked: "source" },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
