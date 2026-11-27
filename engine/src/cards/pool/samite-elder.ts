import { defineCard } from "../define.js";

// EDHREC rank 24190.
//
// The target is only where the colours are read: each of its colours as the
// ability resolves (`colorsOf: 0`), fixed then, so a creature that comes
// under your control later doesn't gain it and a colour the target gains
// later isn't added (rule 611.2c). A colourless target gives nothing.
const TEXT =
  "{T}: Choose target permanent you control. Creatures you control gain protection from each of that permanent's colors until end of turn.";

export default defineCard({
  name: "Samite Elder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "grant-protection",
        filter: { type: "creature", controlledBy: "you" },
        from: { colorsOf: 0 },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
