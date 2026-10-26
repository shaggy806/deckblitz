import { defineCard } from "../define.js";

export default defineCard({
  name: "Splicer's Skill",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Create a 3/3 colorless Phyrexian Golem artifact creature token.\n" +
    "Splice onto instant or sorcery {3}{W} (As you cast an instant or sorcery spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "instant-or-sorcery", cost: "{3}{W}" },
  effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
});
