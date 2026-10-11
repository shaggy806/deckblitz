import { defineCard } from "../define.js";

// EDHREC rank 6836.
//
// Rulings:
//   [2024-09-20] If a source you control deals noncombat damage to multiple opponents
//     simultaneously while there are four or more card types among cards in your graveyard,
//     Fear of Burning Alive's last ability will trigger once for each opponent dealt noncombat
//     damage this way.
//   [2024-09-20] Fear of Burning Alive's last ability deals damage equal to the amount of
//     noncombat damage dealt by the source that dealt damage to an opponent.
//
// Niv-Mizzet, Visionary's trigger (once per recipient, `triggerValue` the
// amount dealt to that opponent) with delirium as an intervening-if (Demolisher
// Spawn), its target a creature of the player dealt damage (Sigil of Sleep's
// `trigger-player`). This creature deals the damage, so its own enters damage
// can set it off.
const ETB_TEXT = "When this creature enters, it deals 4 damage to each opponent.";
const DELIRIUM_TEXT =
  "Delirium — Whenever a source you control deals noncombat damage to an opponent, if there are four or more card types among cards in your graveyard, this creature deals that amount of damage to target creature that player controls.";

export default defineCard({
  name: "Fear of Burning Alive",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 4,
  text: `${ETB_TEXT}\n${DELIRIUM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "each-opponent" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "you-control", to: "opponent", combat: false },
      condition: { kind: "delirium" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: DELIRIUM_TEXT,
    },
  ],
});
