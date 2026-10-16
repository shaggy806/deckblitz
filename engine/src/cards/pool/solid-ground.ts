import { defineCard } from "../define.js";

// EDHREC rank 6182.
//
// Rulings:
//   [2025-10-02] If a land was animated by earthbend and would go to any zone other than the
//     graveyard or exile, it will not be returned to the battlefield by the delayed triggered
//     ability created by earthbend.
//   [2025-10-02] If you control multiple copies of Solid Ground, they each increase the number of
//     +1/+1 counters put on a permanent you control by one.
//   [2025-10-02] You may target a land that is already a creature, perhaps because of a previous
//     earthbend ability. The land will get the +1/+1 counters, gain haste, and have its base power
//     and toughness set to 0/0.
//   [2025-10-02] If two or more effects attempt to modify how many counters would be put on a
//     permanent you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.
//   [2025-10-02] If a permanent you control would enter with a number of +1/+1 counters on it, it
//     enters with that many plus one instead.
//
// Badgermole's earthbend and Kami of Whispered Hopes' replacement. Solid
// Ground is on the battlefield as its own enters ability resolves, so the
// earthbend's three counters come out as four.

const ENTER_TEXT = "When this enchantment enters, earthbend 3.";
const SCALES_TEXT =
  "If one or more +1/+1 counters would be put on a permanent you control, that many plus one +1/+1 counters are put on it instead.";

export default defineCard({
  name: "Solid Ground",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text:
    "When this enchantment enters, earthbend 3. (Target land you control becomes a 0/0 creature with haste that's still a land. Put three +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)\n" +
    SCALES_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1" },
      text: SCALES_TEXT,
    },
  ],
});
