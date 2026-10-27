import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 10734.
// Bosh can sacrifice itself to its own ability (the ruling); the sacrificed
// artifact's mana value is read as it last existed, {X} counting 0.

const TEXT =
  "{3}{R}, Sacrifice an artifact: Bosh deals damage equal to the sacrificed artifact's mana value to any target.";

export default defineCard({
  name: "Bosh, Iron Golem",
  manaCost: "{8}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 6,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false, sacrifice: { filter: { type: "artifact", controlledBy: "you" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { manaValueOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
