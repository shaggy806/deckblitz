import { defineCard } from "../define.js";

// EDHREC rank 30935. Two animations, each until end of turn; the second also
// takes flying away, later in timestamp than the first's grant — so the first
// then the second is a 3/2 without flying (the ruling), and the second then the
// first a 2/1 flier.

const FLYER_TEXT = "{2}: Until end of turn, this artifact becomes a 2/1 Construct artifact creature with flying.";
const GROUND_TEXT = "{2}: Until end of turn, this artifact becomes a 3/2 Construct artifact creature and loses flying.";

export default defineCard({
  name: "Chimeric Sphere",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${FLYER_TEXT}\n${GROUND_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 1,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Construct"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: FLYER_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 3,
            toughness: 2,
            addTypes: ["artifact", "creature"],
            addSubtypes: [],
            setSubtypes: ["Construct"],
            duration: "end-of-turn",
          },
          { kind: "lose-keywords", target: "source", keywords: ["flying"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GROUND_TEXT,
    },
  ],
});
