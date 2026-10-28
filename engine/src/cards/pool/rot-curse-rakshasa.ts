import { defineCard } from "../define.js";

// EDHREC rank 6233.
//
// A decayed counter gives its creature decayed (rule 122.1b — the engine's
// keyword counters).

const RENEW_TEXT =
  "Renew — {X}{B}{B}, Exile this card from your graveyard: Put a decayed counter on each of X target creatures. Activate only as a sorcery.";

export default defineCard({
  name: "Rot-Curse Rakshasa",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["trample", "decayed"],
  text: `Trample\nDecayed (This creature can't block. When it attacks, sacrifice it at end of combat.)\n${RENEW_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{B}{B}", tap: false },
      targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "decayed", amount: 1 },
      },
      resolve: null,
      text: RENEW_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
