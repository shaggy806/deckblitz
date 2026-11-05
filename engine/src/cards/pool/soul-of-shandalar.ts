import { defineCard } from "../define.js";

// Each ability must target a player or planeswalker; the creature, controlled
// by that player or that planeswalker's controller, is up to one (`sameController`
// on slot 0, Searing Blaze's shape). Exiling the card is part of the last
// ability's cost.

const BATTLEFIELD_TEXT =
  "{3}{R}{R}: This creature deals 3 damage to target player or planeswalker and 3 damage to up to one target creature that player or that planeswalker's controller controls.";
const GRAVEYARD_TEXT =
  "{3}{R}{R}, Exile this card from your graveyard: It deals 3 damage to target player or planeswalker and 3 damage to up to one target creature that player or that planeswalker's controller controls.";
const targets = [
  "player-or-planeswalker",
  { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 }, sameController: true, sameObjectAllowed: true } },
] as const;
const effect = {
  kind: "sequence",
  simultaneous: true,
  effects: [
    { kind: "damage", amount: 3, target: 0 },
    { kind: "damage", amount: 3, target: 1 },
  ],
} as const;

export default defineCard({
  name: "Soul of Shandalar",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["first-strike"],
  text: `First strike\n${BATTLEFIELD_TEXT}\n${GRAVEYARD_TEXT}`,
  activated: [
    { cost: { mana: "{3}{R}{R}", tap: false }, targets, effect, resolve: null, text: BATTLEFIELD_TEXT },
    { cost: { mana: "{3}{R}{R}", tap: false }, zone: "graveyard", targets, effect, resolve: null, text: GRAVEYARD_TEXT },
  ],
});
