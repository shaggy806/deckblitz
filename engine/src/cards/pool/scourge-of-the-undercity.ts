import { defineCard } from "../define.js";

// EDHREC rank 18548. Blooming Stinger's "another target creature you
// control".

export default defineCard({
  name: "Scourge of the Undercity",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon", "Vampire"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature enters, another target creature you control gains lifelink until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, another target creature you control gains lifelink until end of turn.",
    },
  ],
});
