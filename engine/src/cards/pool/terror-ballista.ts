import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 19440. The Brothers' War.
// Rulings:
//   You don't choose a target for Terror Ballista's triggered ability when it attacks. If you
//   choose to sacrifice a creature, a second triggered ability triggers and you choose a target
//   for that second ability. Players may respond as normal to this second ability.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature. When you do, destroy target creature an opponent controls.";
const UNEARTH_TEXT =
  "Unearth {3}{B}{B} ({3}{B}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)";

export default defineCard({
  name: "Terror Ballista",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${ATTACK_TEXT}\n${UNEARTH_TEXT}`,
  activated: [unearth("{3}{B}{B}")],
  triggered: [
    {
      // Cavalier of Night's shape: the reflexive "when you do" picks its
      // target only once the sacrifice is made.
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target creature an opponent controls.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
