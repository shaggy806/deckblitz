import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

// EDHREC rank 4067.
//
// The granted trigger is It That Betrays' with Prince of Thralls' punisher:
// "that player" is the one who sacrificed it (`"trigger-player"`). "That
// card" is followed to wherever the sacrifice put it — a graveyard, or exile
// under Rest in Peace (its ruling) — and is the card only there: one that has
// left since stays where it is, though the opponent is still asked to pay (its
// ruling).

const SAC_TEXT =
  "Whenever an opponent sacrifices a nontoken permanent, put that card onto the battlefield under your control unless that player pays 3 life.";

export default defineCard({
  name: "Nazgûl Battle-Mace",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has menace, deathtouch, annihilator 1, and "${SAC_TEXT}" (Whenever a creature with annihilator 1 attacks, defending player sacrifices a permanent of their choice.)\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["menace", "deathtouch"],
      grantsTriggered: [
        annihilator(1),
        {
          trigger: { on: "sacrifice", who: "opponent", filter: { token: false } },
          targets: [],
          effect: {
            kind: "unless",
            chooser: "trigger-player",
            options: [{ payLife: 3, text: "Pay 3 life" }],
            otherwise: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
          },
          resolve: null,
          text: SAC_TEXT,
        },
      ],
      text: `Equipped creature has menace, deathtouch, annihilator 1, and "${SAC_TEXT}"`,
    },
  ],
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
});
