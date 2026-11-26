import { defineCard } from "../define.js";
import { outlast } from "../helpers.js";

const WARRIOR_TEXT = "Whenever you activate this creature's outlast ability, create a 1/1 white Warrior creature token.";

export default defineCard({
  name: "Herald of Anafenza",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text:
    "Outlast {2}{W} ({2}{W}, {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)\n" +
    WARRIOR_TEXT,
  activated: [outlast("{2}{W}")],
  triggered: [
    {
      // Its own printed outlast (activated[0]), not one granted to it.
      trigger: { on: "activates-ability", who: "you", ownAbility: 0 },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token", count: 1 },
      resolve: null,
      text: WARRIOR_TEXT,
    },
  ],
});
