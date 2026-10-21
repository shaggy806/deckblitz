import { defineCard } from "../define.js";

// EDHREC rank 13406.
//
// "Your choice of deathtouch or lifelink" is chosen as the spell resolves.

export default defineCard({
  name: "Alchemist's Gift",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +1/+1 and gains your choice of deathtouch or lifelink until end of turn. (Any amount of damage a creature with deathtouch deals to a creature is enough to destroy it. Damage dealt by a creature with lifelink also causes its controller to gain that much life.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Deathtouch", effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" } },
          { text: "Lifelink", effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" } },
        ],
      },
    ],
  },
});
