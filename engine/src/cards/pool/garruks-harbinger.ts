import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Hexproof from black (rule 702.11d): an opponent's black spell, or an
// ability from a black source they control, can't target it. "A player or
// planeswalker" is a trigger per kind of recipient, each once per hit for
// that hit's amount (The Reaver Cleaver's shape).

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player or planeswalker, look at that many cards from the top of your library. You may reveal a creature card or Garruk planeswalker card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

const lookFor = (to: "player" | "planeswalker"): TriggeredAbility => ({
  trigger: { on: "deals-damage", who: "self", combat: true, to },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { triggerValue: true },
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { anyOf: [{ type: "creature" }, { type: "planeswalker", subtype: "Garruk" }] },
    destination: "hand",
    leftover: "bottom-random",
  },
  resolve: null,
  text: TRIGGER_TEXT,
});

export default defineCard({
  name: "Garruk's Harbinger",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 3,
  text: `Hexproof from black\n${TRIGGER_TEXT}`,
  static: [{ affects: { scope: "self" }, hexproofFrom: { colors: ["B"] }, text: "Hexproof from black" }],
  triggered: [lookFor("player"), lookFor("planeswalker")],
});
