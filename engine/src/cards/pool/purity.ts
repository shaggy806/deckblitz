import { defineCard } from "../define.js";

const PREVENT_TEXT =
  "If noncombat damage would be dealt to you, prevent that damage. You gain life equal to the damage prevented this way.";
const SHUFFLE_TEXT = "When Purity is put into a graveyard from anywhere, shuffle it into its owner's library.";

export default defineCard({
  name: "Purity",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${PREVENT_TEXT}\n${SHUFFLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        prevent: true,
        perEvent: true,
        to: "you",
        then: { kind: "gain-life", amount: "x" },
      },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
