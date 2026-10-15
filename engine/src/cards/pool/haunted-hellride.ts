import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 19249. Battlesong Berserker's attack trigger, then "untap it":
// the same target, untapped as the trigger resolves (after attackers are
// declared, so an attacker stays attacking).

const ATTACK_TEXT =
  "Whenever you attack, target creature you control gets +1/+0 and gains deathtouch until end of turn. Untap it.";

export default defineCard({
  name: "Haunted Hellride",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(1)],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
