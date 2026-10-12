import { defineCard } from "../define.js";

export default defineCard({
  name: "Viscid Lemures",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 3,
  text: "{0}: This creature gets -1/-0 and gains swampwalk until end of turn. (It can't be blocked as long as defending player controls a Swamp.)",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: -1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "swampwalk",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{0}: This creature gets -1/-0 and gains swampwalk until end of turn.",
    },
  ],
});
