import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// EDHREC rank 11933.

export default defineCard({
  name: "Zephyrim",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  miracle: { cost: "{1}{W}" },
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)\nFlying, vigilance\nMiracle {1}{W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  triggered: [squadTrigger()],
});
