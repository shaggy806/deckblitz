import { defineCard } from "../define.js";

// March of the Machines' static with the abilities lost (layer 6). Its layer 4
// part reaches each noncreature artifact and keeps that set for layers 6 and
// 7b (rule 613.6), so it doesn't switch itself off by making them creatures.
// As it leaves the battlefield the static carries on as a timed static until
// the cleanup step (`lingersAfterLeaving`), reaching what comes later too.
const TEXT =
  "Each noncreature artifact loses all abilities and becomes an artifact creature with power and toughness each equal to its mana value. If this enchantment leaves the battlefield, this effect continues until end of turn.";

export default defineCard({
  name: "Titania's Song",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", notTypes: ["creature"] } },
      addTypes: ["creature"],
      loseAllAbilities: true,
      setBasePt: { power: "its-mana-value", toughness: "its-mana-value" },
      lingersAfterLeaving: "end-of-turn",
      text: TEXT,
    },
  ],
});
