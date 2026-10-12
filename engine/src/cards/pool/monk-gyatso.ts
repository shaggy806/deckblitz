import { defineCard } from "../define.js";

// EDHREC rank 5327.
//
// Rulings: airbend's — its owner may cast the card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
//
// One trigger per creature targeted, whoever's spell or ability it is; it
// resolves first, so airbending the creature leaves that spell or ability
// with an illegal target. "That creature" is the one targeted, only while it's
// still that object (rule 400.7).
const TEXT =
  "Whenever another creature you control becomes the target of a spell or ability, you may airbend that creature.";

export default defineCard({
  name: "Monk Gyatso",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Airbend that creature?",
        effect: { kind: "exile", target: "trigger-object", airbend: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
