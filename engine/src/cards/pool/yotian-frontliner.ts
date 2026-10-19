import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// The Brothers' War.
const ATTACK_TEXT = "Whenever this creature attacks, another target creature you control gets +1/+1 until end of turn.";

export default defineCard({
  name: "Yotian Frontliner",
  manaCost: "{1}",
  types: ["artifact", "creature"],
  subtypes: ["Soldier"],
  power: 1,
  toughness: 1,
  text:
    `${ATTACK_TEXT}\nUnearth {W} ({W}: Return this card from your graveyard to the battlefield. It gains haste. ` +
    "Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [unearth("{W}")],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
