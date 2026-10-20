import { defineCard } from "../define.js";

const UNTAP_TEXT = "{1}{U}, {T}: Target creature doesn't untap during its controller's next untap step.";
const SURVEIL_TEXT = "{2}{B}, {T}: Surveil 2.";

export default defineCard({
  name: "House Guildmage",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${UNTAP_TEXT}\n${SURVEIL_TEXT} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: UNTAP_TEXT,
    },
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
