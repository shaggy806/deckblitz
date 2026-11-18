import { defineCard } from "../define.js";

// EDHREC rank 16090.
//
// The attacking opponent gains control until end of combat (rules 500.5a,
// 511.2), and you choose among the players and planeswalkers their other
// creatures are attacking as it resolves — never a battle, never one every
// attacker has stopped attacking, and perhaps you (the rulings): `is-attacking`
// with `amongAttacked`. With nothing to choose it isn't attacking. It was never
// declared, so no "attacks" trigger sees it and no attack restriction stops it
// (508.4c). It stays tapped, so it may attack again in the next opponent's
// combat.

const BLOCK_TEXT = "Tahngarth can't be blocked by more than one creature.";
const ATTACK_TEXT =
  "Whenever an opponent attacks with one or more creatures, if Tahngarth is tapped, you may have that opponent gain control of Tahngarth until end of combat. If you do, choose a player or planeswalker that opponent is attacking. Tahngarth is attacking that player or planeswalker.";

export default defineCard({
  name: "Tahngarth, First Mate",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 5,
  toughness: 5,
  text: `${BLOCK_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }], text: BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "attack-with", who: "opponent" },
      condition: { kind: "source", filter: { tapped: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have that opponent gain control of Tahngarth until end of combat, attacking a player or planeswalker they're attacking?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "active-player", until: "until-end-of-combat" },
            { kind: "is-attacking", target: "source", at: { amongAttacked: true } },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
