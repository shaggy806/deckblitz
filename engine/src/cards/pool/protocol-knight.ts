import { defineCard } from "../define.js";

// EDHREC rank 24819.
//
// "If you control another Knight" is checked as the ability resolves, and
// counts any Knight other than Protocol Knight — whether or not you still
// control it, or it's still a Knight (the ruling). The target may already be
// tapped (the ruling).
const TEXT =
  "When this creature enters, tap target creature an opponent controls. Put a stun counter on that creature if you control another Knight.";

export default defineCard({
  name: "Protocol Knight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  text: `${TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Knight" }, atLeast: 1, excludeSelf: true },
            then: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
