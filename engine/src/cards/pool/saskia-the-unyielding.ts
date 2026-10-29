import { defineCard } from "../define.js";

// Commander 2016. "It deals that much damage": the creature that dealt the
// combat damage is the source of the new damage, not Saskia (its ruling) —
// as it last existed, if it has left. The chosen player may be its
// controller, or the player who was just dealt the damage.

const CHOOSE = "As Saskia enters, choose a player.";
const REDIRECT =
  "Whenever a creature you control deals combat damage to a player, it deals that much damage to the chosen player.";

export default defineCard({
  name: "Saskia the Unyielding",
  manaCost: "{B}{R}{G}{W}",
  colors: ["B", "R", "G", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance", "haste"],
  text: `Vigilance, haste\n${CHOOSE}\n${REDIRECT}`,
  choosePlayerOnEnter: "player",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "damage", who: "chosen-player", amount: { triggerValue: true }, from: "trigger-object" },
      resolve: null,
      text: REDIRECT,
    },
  ],
});
