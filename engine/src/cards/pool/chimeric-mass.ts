import { defineCard } from "../define.js";

const ANIMATE =
  '{1}: Until end of turn, this artifact becomes a Construct artifact creature with "This creature\'s power and toughness are each equal to the number of charge counters on it."';

export default defineCard({
  name: "Chimeric Mass",
  manaCost: "{X}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters with X charge counters on it.\n${ANIMATE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: "x" } },
      text: "This artifact enters with X charge counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "animate", target: "source", addTypes: ["artifact", "creature"], addSubtypes: ["Construct"], duration: "end-of-turn" },
          {
            kind: "grant-static",
            target: "source",
            ability: {
              affects: { scope: "self" },
              setBasePtFromCount: { countOf: { countersOnThis: "charge" }, plusPower: 0, plusToughness: 0 },
              text: "This creature's power and toughness are each equal to the number of charge counters on it.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
