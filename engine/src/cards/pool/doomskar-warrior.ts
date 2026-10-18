import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 14721. March of the Machine.
//
// Backup grants what's printed below it — trample and the damage trigger —
// fixed as it triggers. "That many" is the combat damage dealt to that one
// player or battle (`triggerValue`): damage to several at once triggers once
// for each (the ruling).

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player or battle, look at that many cards from the top of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

const DAMAGE: TriggeredAbility = {
  trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { triggerValue: true },
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    leftover: "bottom-random",
  },
  resolve: null,
  text: DAMAGE_TEXT,
};

export default defineCard({
  name: "Doomskar Warrior",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following abilities until end of turn.)\nTrample\n${DAMAGE_TEXT}`,
  triggered: [backup(1, { keywords: ["trample"], triggered: [DAMAGE] }), DAMAGE],
});
