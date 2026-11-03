import { defineCard } from "../define.js";

// EDHREC rank 13856. Tales of Middle-earth Commander.
//
// Rulings:
//   [2023-06-16] If a player is attacking a planeswalker you control or a battle you're
//     protecting but not attacking you, Mirkwood Trapper's last ability will still trigger.
// "Attacks you" is `attacks-player` with `defender: "you"` — once per
// declaration that has a creature attacking you. "If they aren't attacking
// you" is `attack-with`'s `notAttackingYou`, an intervening if asked again as
// it resolves (rule 603.4); the attacking player (the active player) makes
// the untargeted choice.
const DEFEND_TEXT = "Whenever a player attacks you, target attacking creature gets -2/-0 until end of turn.";
const ELSEWHERE_TEXT =
  "Whenever a player attacks, if they aren't attacking you, that player chooses an attacking creature. It gets +2/+0 until end of turn.";

export default defineCard({
  name: "Mirkwood Trapper",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 1,
  toughness: 4,
  text: `${DEFEND_TEXT}\n${ELSEWHERE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "you" },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: DEFEND_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "any", notAttackingYou: true },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "active-player",
        filter: { type: "creature", attacking: true },
        min: 1,
        upTo: 1,
        prompt: "Choose an attacking creature to get +2/+0",
        then: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: ELSEWHERE_TEXT,
    },
  ],
});
