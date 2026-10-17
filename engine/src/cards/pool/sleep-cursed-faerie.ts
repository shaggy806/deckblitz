import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const ENTERS =
  "This creature enters tapped with three stun counters on it. (If it would become untapped, remove a stun counter from it instead.)";
const UNTAP = "{1}{U}: Untap this creature.";

export default defineCard({
  name: "Sleep-Cursed Faerie",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying, ward {2}\n${ENTERS}\n${UNTAP}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP,
    },
  ],
  triggered: [ward({ mana: "{2}" })],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "stun", amount: 3 } },
      text: ENTERS,
    },
  ],
});
