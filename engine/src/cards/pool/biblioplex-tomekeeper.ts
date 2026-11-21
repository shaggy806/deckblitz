import { defineCard } from "../define.js";

// EDHREC rank 18281.
//
// A "choose up to one" enters trigger (Sawblade Slinger's shape): `become-prepared`
// (rule 722.3a) or `become-unprepared` (722.3b) on a target creature. Neither does
// anything to a creature without a prepare spell, one already prepared, or (the
// second) one that isn't prepared (the ruling).
//
// Rulings:
//   The first mode of Biblioplex Tomekeeper's last ability won't have any effect on a
//   creature that has no prepare spell or is already prepared. Similarly, the second
//   mode won't have any effect on a creature that isn't already prepared.

const PREPARE_TEXT = "Target creature becomes prepared. (Only creatures with prepare spells can become prepared.)";
const UNPREPARE_TEXT = "Target creature becomes unprepared.";
const ENTER_TEXT = `When this creature enters, choose up to one —\n• ${PREPARE_TEXT}\n• ${UNPREPARE_TEXT}`;

export default defineCard({
  name: "Biblioplex Tomekeeper",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: PREPARE_TEXT, targets: ["creature"], effect: { kind: "become-prepared", target: 0 } },
          { text: UNPREPARE_TEXT, targets: ["creature"], effect: { kind: "become-unprepared", target: 0 } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
