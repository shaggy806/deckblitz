import { defineCard } from "../define.js";

// EDHREC rank 29771.

const TAP_TEXT = "{W}, {T}: Tap target creature.";
const UNTAP_TEXT = "Whenever you cast a Spirit or Arcane spell, untap this creature.";

export default defineCard({
  name: "Innocence Kami",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: `${TAP_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
