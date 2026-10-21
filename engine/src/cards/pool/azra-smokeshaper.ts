import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const ENTERS_TEXT = "When this creature enters, target creature you control gains indestructible until end of turn.";

export default defineCard({
  name: "Azra Smokeshaper",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Azra", "Ninja"],
  power: 3,
  toughness: 3,
  text: `${ninjutsuText("{1}{B}")}\n${ENTERS_TEXT}`,
  activated: [ninjutsu("{1}{B}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
