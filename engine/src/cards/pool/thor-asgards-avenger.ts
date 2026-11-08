import { defineCard } from "../define.js";

const TEXT =
  "If another source you control would deal damage to an opponent or a permanent an opponent controls, it deals that much damage plus 1 instead.";

export default defineCard({
  name: "Thor, Asgard's Avenger",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["God", "Warrior", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { modify: { plus: 1 } },
        fromOther: true,
        source: { controlledBy: "you" },
        to: "opponent-side",
      },
      text: TEXT,
    },
  ],
});
