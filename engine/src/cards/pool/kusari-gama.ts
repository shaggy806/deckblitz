import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 10799.

const PUMP_TEXT = "{2}: This creature gets +1/+0 until end of turn.";
const GRANT_TEXT = `Equipped creature has "${PUMP_TEXT}"`;
const SWEEP_TEXT =
  "Whenever equipped creature deals damage to a blocking creature, this Equipment deals that much damage to each other creature defending player controls.";

// Once for each blocking creature dealt damage, "that much" what that one was
// dealt (after prevention and doubling — damage prevented was never dealt,
// rule 615.1). The Equipment deals it, as the ability's own source. The
// defending player is the one the equipped creature is attacking, or was
// before it left combat (rule 802.2a); for one that never attacked (a pinger
// hitting a blocker), the blocking creature's controller, a defending player
// (rule 509.1a). "Other" spares the blocker that was dealt the damage.
export default defineCard({
  name: "Kusari-Gama",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT_TEXT}\n${SWEEP_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [equip("{3}")],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "creature", toFilter: { blocking: true } },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature" },
        amount: { triggerValue: true },
        whose: { defendingPlayerOf: "trigger-object", orElse: "trigger-player" },
        except: "trigger-recipient",
      },
      resolve: null,
      text: SWEEP_TEXT,
    },
  ],
});
