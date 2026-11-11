import { defineCard } from "../define.js";

// The attack trigger makes a delayed "whenever" of its controller's (rule
// 603.7e) that watches one player, the defending player, through the end of
// that player's next turn. Each attack makes another, so they add up.
const ATTACK_TEXT =
  "Whenever equipped creature attacks, until the end of defending player's next turn, that player gets two rad counters whenever they cast a spell.";

export default defineCard({
  name: "Nuka-Nuke Launcher",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +3/+0 and has intimidate. (It can't be blocked except by artifact creatures and/or creatures that share a color with it.)\n${ATTACK_TEXT}\nEquip {3}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "cast-spell", who: "any" },
          byPlayer: "trigger-player",
          until: { throughTurnOf: "trigger-player" },
        },
        effect: { kind: "add-player-counters", counter: "rad", amount: 2, who: "trigger-controller" },
        text: "Whenever that player casts a spell, they get two rad counters.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      grantKeywords: ["intimidate"],
      text: "Equipped creature gets +3/+0 and has intimidate.",
    },
  ],
});
