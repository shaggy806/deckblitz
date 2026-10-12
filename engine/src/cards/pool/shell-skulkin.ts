import { defineCard } from "../define.js";

export default defineCard({
  name: "Shell Skulkin",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 3,
  toughness: 2,
  text: "{3}: Target blue creature gains shroud until end of turn. (It can't be the target of spells or abilities.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["U"], type: "creature" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: "{3}: Target blue creature gains shroud until end of turn.",
    },
  ],
});
