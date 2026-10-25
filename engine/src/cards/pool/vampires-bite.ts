import { defineCard } from "../define.js";

// EDHREC rank 21346.
export default defineCard({
  name: "Vampire's Bite",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker {2}{B} (You may pay an additional {2}{B} as you cast this spell.)\nTarget creature gets +3/+0 until end of turn. If this spell was kicked, that creature gains lifelink until end of turn. (Damage dealt by the creature also causes its controller to gain that much life.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
  kicker: {
    cost: "{2}{B}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      ],
    },
  },
});
