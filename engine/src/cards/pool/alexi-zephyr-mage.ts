import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 24006.

const TEXT = "{X}{U}, {T}, Discard two cards: Return X target creatures to their owners' hands.";

export default defineCard({
  name: "Alexi, Zephyr Mage",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{U}", tap: true, discard: { count: 2 } },
      // Exactly X targets (Champion of Stray Souls' shape).
      targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
