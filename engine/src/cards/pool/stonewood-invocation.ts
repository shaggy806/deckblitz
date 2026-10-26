import { defineCard } from "../define.js";

// EDHREC rank 17605.

export default defineCard({
  name: "Stonewood Invocation",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nTarget creature gets +5/+5 and gains shroud until end of turn. (It can't be the target of spells or abilities.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "end-of-turn" },
    ],
  },
});
