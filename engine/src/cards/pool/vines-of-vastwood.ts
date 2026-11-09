import { defineCard } from "../define.js";

export default defineCard({
  name: "Vines of Vastwood",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {G} (You may pay an additional {G} as you cast this spell.)\nTarget creature can't be the target of spells or abilities your opponents control this turn. If this spell was kicked, that creature gets +4/+4 until end of turn.",
  targets: ["creature"],
  effect: { kind: "prohibit", prohibits: [{ act: "be-targeted", target: 0, by: "opponents" }] },
  kicker: {
    cost: "{G}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "prohibit", prohibits: [{ act: "be-targeted", target: 0, by: "opponents" }] },
        { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      ],
    },
  },
});
