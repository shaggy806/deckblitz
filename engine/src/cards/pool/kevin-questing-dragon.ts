import { defineCard } from "../define.js";
import { bushido, rampage } from "../helpers.js";

// Trample over planeswalkers assigns as trample does (rule 702.19c).

const STEAL_TEXT = "Whenever Kevin deals combat damage to a player, gain control of target land that player controls. Untap it.";

export default defineCard({
  name: "Kevin, Questing Dragon",
  manaCost: "{4}{R}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 8,
  toughness: 8,
  keywords: ["flying", "mountainwalk", "trample-over-planeswalkers"],
  cantBeCountered: true,
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: `Kevin can't be countered, devour 2\nFlying, mountainwalk, rampage 2, bushido 2, trample over planeswalkers\nDamage can't be prevented.\nPlayers can't gain life.\n${STEAL_TEXT}`,
  triggered: [
    rampage(2),
    ...bushido(2),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "land" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
  static: [
    { affects: { scope: "self" }, damageCantBePrevented: {}, text: "Damage can't be prevented." },
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: "Players can't gain life.",
    },
  ],
});
