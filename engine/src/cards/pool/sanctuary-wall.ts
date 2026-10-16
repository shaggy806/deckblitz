import { defineCard } from "../define.js";

const TEXT =
  "{2}{W}, {T}: Tap target creature. You may put a stun counter on it. If you do, put a stun counter on this creature. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Sanctuary Wall",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            kind: "may",
            prompt: "Put a stun counter on it? If you do, put a stun counter on this creature.",
            effect: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
            then: { kind: "add-counter", target: "source", counter: "stun", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
