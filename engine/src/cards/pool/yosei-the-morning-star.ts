import { defineCard } from "../define.js";

const TRIGGER =
  "When Yosei dies, target player skips their next untap step. Tap up to five target permanents that player controls.";

// The rulings: with the player illegal the permanents are still tapped, with
// the permanents illegal the player still skips — each step minds its own slot.
export default defineCard({
  name: "Yosei, the Morning Star",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dragon", "Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player", { kind: "any-number", of: "permanent", max: 5, sameController: { slot: 0 } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "skip-untap-step", who: 0 },
          { kind: "for-each-target", from: 1, simultaneous: true, effect: { kind: "tap", target: 1 } },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
