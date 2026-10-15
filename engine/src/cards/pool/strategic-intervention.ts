import { defineCard } from "../define.js";

// EDHREC rank 25430.
//
// "Defending player" is the player the lone attacker is attacking (the
// controller of the planeswalker it attacks, if that): the attacks-alone
// trigger's `trigger-player`. The pump reads the attacker off the trigger
// object, as Widow's Walk does.

const TEXT =
  "Whenever a creature you control attacks alone, it gets +1/+1 until end of turn. Tap up to one target creature defending player controls.";

export default defineCard({
  name: "Strategic Intervention",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "trigger-player", filter: { type: "creature" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "tap", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
