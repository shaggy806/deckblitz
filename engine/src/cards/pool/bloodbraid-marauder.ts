import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2).
//
// "This spell has cascade as long as …": cascade is a "when you cast this
// spell" trigger (rule 702.85a), so the spell has it — and it triggers — only
// if delirium holds as the casting finishes (the first ruling: a permanent
// sacrificed for mana while casting counts). That is part of the trigger
// condition (`whileCondition`, rule 603.1), not an intervening if: once
// triggered, cascade resolves whatever the graveyard holds by then.
const CANT_BLOCK_TEXT = "This creature can't block.";
const DELIRIUM_TEXT =
  "Delirium — This spell has cascade as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Bloodbraid Marauder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 1,
  text: `${CANT_BLOCK_TEXT}\n${DELIRIUM_TEXT} (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: CANT_BLOCK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      whileCondition: { kind: "delirium" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: DELIRIUM_TEXT,
    },
  ],
});
