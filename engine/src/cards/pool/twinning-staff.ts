import { defineCard } from "../define.js";

// EDHREC rank 1705. The replacement applies to one instruction to copy a spell
// (`would-copy-spell`), never an ability or a card: its controller's copy, with
// new targets allowed on the additional one even if the instruction allows none,
// and that copy placed where they choose among those that couldn't take new
// targets (the rulings).

const REPLACEMENT =
  "If you would copy a spell one or more times, instead copy it that many times plus an additional time. You may choose new targets for the additional copy.";
const ACTIVATED = "{7}, {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy.";

export default defineCard({
  name: "Twinning Staff",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${REPLACEMENT}\n${ACTIVATED}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-copy-spell", instead: { modify: { plus: 1 } } },
      text: REPLACEMENT,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}", tap: true },
      targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
