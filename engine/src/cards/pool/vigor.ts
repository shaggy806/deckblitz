import { defineCard } from "../define.js";

const PREVENT_TEXT =
  "If damage would be dealt to another creature you control, prevent that damage. Put a +1/+1 counter on that creature for each 1 damage prevented this way.";
const SHUFFLE_TEXT = "When Vigor is put into a graveyard from anywhere, shuffle it into its owner's library.";

export default defineCard({
  name: "Vigor",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${PREVENT_TEXT}\n${SHUFFLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        toFilter: { type: "creature", controlledBy: "you" },
        toOther: true,
        then: { kind: "add-counter", target: "trigger-recipient", counter: "+1/+1", amount: "x" },
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
