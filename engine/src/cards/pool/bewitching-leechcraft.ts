import { defineCard } from "../define.js";

// EDHREC rank 22676. The granted replacement (`would-untap-in-untap-step`) is
// the creature's own, "your" its controller: with no +1/+1 counter to remove
// it doesn't untap, and with a stun counter as well its controller chooses
// which applies first (rule 616.1) — this one first, then the stun counter
// replaces the untap it leaves (616.1f).

const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const GRANTED =
  "If this creature would untap during your untap step, remove a +1/+1 counter from it instead. If you do, untap it.";
const GRANT_TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Bewitching Leechcraft",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${GRANT_TEXT} (Otherwise, it doesn't untap.)`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsStatic: [
        {
          affects: { scope: "self" },
          replacement: {
            event: "would-untap-in-untap-step",
            filter: { isSource: true },
            instead: { removeCounter: "+1/+1", amount: 1, ifRemovedUntap: true },
          },
          text: GRANTED,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
