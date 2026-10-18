import { defineCard } from "../define.js";

// Rulings:
//   [2023-02-04] If Unctus's Retrofitter leaves the battlefield before its enters-the-battlefield
//     ability resolves, that ability will have no effect. The target artifact won't become an
//     artifact creature at all.
//   [2023-02-04] The resulting artifact creature will be able to attack on your turn if it's been
//     under your control continuously since the turn began. That is, it doesn't matter how long
//     it's been a creature, just how long it's been on the battlefield.
//   [2023-02-04] The target artifact retains any types, subtypes, and supertypes it has.
//   [2023-02-04] Unctus's Retrofitter doesn't remove any abilities the target artifact has.
//   [2023-02-04] Effects that modify a creature's power and/or toughness, such as the one created
//     by Blazing Crescendo or a +1/+1 counter, will apply to the creature no matter when they
//     started to take effect.
//   [2023-02-04] If the artifact was already a creature, its base power and toughness will become
//     4/4. This overwrites any previous effects that set its base power and/or toughness to
//     specific values. Any power- or toughness-setting effects that start to apply after Unctus's
//     Retrofitter's ability resolves will overwrite this effect.
//
// `animate` with `addTypes` (types kept, abilities kept, base P/T set in
// layer 7b in timestamp order) for `"while-source"`: it ends as the
// Retrofitter leaves, and does nothing at all if it already has (rule 611.2b
// — the first ruling).

const ENTER_TEXT =
  "When this creature enters, up to one target artifact you control becomes an artifact creature with base power and toughness 4/4 for as long as this creature remains on the battlefield.";

export default defineCard({
  name: "Unctus's Retrofitter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Artificer"],
  power: 2,
  toughness: 3,
  toxic: 1,
  text: `Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { type: "artifact" } } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "while-source",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
