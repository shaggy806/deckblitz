import { defineCard } from "../define.js";

// The permanent is chosen and the colors compared as this resolves, not as damage
// is dealt (the rulings). `sharesColorWith` also matches the object itself,
// so a colorless creature must be kept out: it shares no color even with itself.

const TEXT =
  "{2}{W}, {T}: Choose a permanent you control. Prevent all combat damage target creature would deal this turn if it shares a color with that permanent.";

export default defineCard({
  name: "Guard Dogs",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 1,
        upTo: 1,
        keepTargets: true,
        prompt: "Choose a permanent you control",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 1, filter: { sharesColorWith: 0, colorless: false } },
          then: { kind: "damage-rule", by: { target: 1 }, combat: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
