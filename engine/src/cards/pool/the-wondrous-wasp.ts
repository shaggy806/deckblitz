import { defineCard } from "../define.js";

// EDHREC rank 12865. Marvel Super Heroes.
//
// Killian's "tap up to one target creature", then Opportunistic Dragon's
// "loses all abilities for as long as this remains on the battlefield"
// (`while-source`): if the Wasp has left before the ability resolves, the
// creature is still tapped but loses nothing (rule 611.2b).
const TEXT =
  "Wasp's Sting — When The Wondrous Wasp enters, tap up to one target creature. It loses all abilities for as long as The Wondrous Wasp remains on the battlefield.";

export default defineCard({
  name: "The Wondrous Wasp",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "lose-abilities", target: 0, duration: "while-source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
