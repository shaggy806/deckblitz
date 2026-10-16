import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Yiazmat, Ultimate Mark's ability for {1}.

const TEXT =
  "{1}, Sacrifice another creature or artifact: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Vanguard of the Rose",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 3,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
