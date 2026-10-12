import { defineCard } from "../define.js";

// EDHREC rank 6842.
// Makes Clue → use "Clue Token".
//
// Rulings:
//   [2025-10-02] Creating a Clue token this way isn't the same thing as investigating. Notably, an
//     ability that triggers whenever you investigate won't trigger because of creating a Clue
//     token this way.
//   [2025-10-02] Effects that modify a creature's power and/or toughness, such as the ones created
//     by Titanic Growth or a +/1+1 counter, will apply to the creature no matter when they started
//     to take effect. The same is true for any counters that change its power and/or toughness and
//     effects that switch power and toughness.
//   [2025-10-02] The resulting artifact creature will be able to attack on your turn if it's been
//     under your control continuously since the turn began. That is, it doesn't matter how long
//     it's been a creature, just how long it's been on the battlefield.
//   [2025-10-02] If the artifact token was already a creature, its base power and toughness will
//     become 3/1. This overwrites any previous effects that set the creature's base power and
//     toughness to specific values. Any power- or toughness-setting effects that start to apply
//     after The Mechanist, Aerial Artisan's ability resolves will overwrite this effect.
//   [2025-10-02] Clue tokens are artifact tokens with "{2}, Sacrifice this token: Draw a card."
//   [2025-10-02] The Mechanist, Aerial Artisan's activated ability doesn't remove any abilities
//     the target artifact token has. The artifact token also retains any types, subtypes, and
//     supertypes other than creature types.

export default defineCard({
  name: "The Mechanist, Aerial Artisan",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Ally"],
  power: 1,
  toughness: 3,
  text: "Whenever you cast a noncreature spell, create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")\n{T}: Until end of turn, target artifact token you control becomes a 3/1 Construct artifact creature with flying.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", token: true } }],
      // It keeps its other types and abilities; "Construct" replaces its
      // creature types (the rulings), and base 3/1 overwrites earlier
      // P/T-setting effects (layer 7b).
      effect: {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 1,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Construct"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Until end of turn, target artifact token you control becomes a 3/1 Construct artifact creature with flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, create a Clue token.",
    },
  ],
});
