import { defineCard } from "../define.js";

// EDHREC rank 18879. Iron-Shield Elf's shape, then a graveyard check as it
// resolves. The indestructible lasts through the transform (the ruling): it's
// an effect on this object, which keeps its identity as it turns over. The
// back face is Bloodsworn Knight.
const TEXT =
  "{1}{B}, Discard a card: This creature gains indestructible until end of turn. Tap it. Then if there are four or more creature cards in your graveyard, transform this creature.";

export default defineCard({
  name: "Bloodsworn Squire",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { type: "creature" } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Bloodsworn Squire", "Bloodsworn Knight"],
  transform: true,
});
