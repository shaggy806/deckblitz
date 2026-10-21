import { defineCard } from "../define.js";

// EDHREC rank 12620.
//
// Rulings:
//   [2019-06-14] As long as Abominable Treefolk is on the battlefield, its first ability will
//     count itself, so it'll be at least 1/1.
//   [2019-06-14] The ability that defines Abominable Treefolk's power and toughness works in all
//     zones, not just the battlefield.
//   [2019-06-14] Abominable Treefolk's last ability can target a creature that's already tapped.
//     That creature won't untap during its controller's next untap step.
// The CDA is `setBasePtFromCount`, which works in every zone (Regal Bunnicorn's).

const PT_TEXT =
  "Abominable Treefolk's power and toughness are each equal to the number of snow permanents you control.";
const ETB_TEXT =
  "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Abominable Treefolk",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}\n${ETB_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { supertype: "snow", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
