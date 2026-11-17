import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// An attacker deals its combat damage to the one player or planeswalker it
// attacks, so the two triggers never fire for the same damage (Psychic Frog's
// shape). A card put into the graveyard during this combat phase — by combat
// damage or any other way, from any zone — can't be targeted (the ruling); one
// put there before this combat began can (the journal's `to-graveyard` entries
// carry the combat phase they happened in). Storrev dying to the same combat
// damage still triggers (the ruling), and is then itself a card put there this
// combat.

const RETURN_TEXT =
  "Whenever Storrev deals combat damage to a player or planeswalker, return to your hand target creature or " +
  "planeswalker card in your graveyard that wasn't put there this combat.";

const RETURN_TARGET = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: {
    typesAnyOf: ["creature", "planeswalker"],
    not: { journaled: { what: "to-graveyard", thisCombat: true } },
  },
} as const;

const returnOn = (to: "player" | "planeswalker"): TriggeredAbility => ({
  trigger: { on: "deals-damage", who: "self", to, combat: true },
  targets: [RETURN_TARGET],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  resolve: null,
  text: RETURN_TEXT,
});

export default defineCard({
  name: "Storrev, Devkarin Lich",
  manaCost: "{1}{B}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Elf", "Wizard"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${RETURN_TEXT}`,
  triggered: [returnOn("player"), returnOn("planeswalker")],
});
