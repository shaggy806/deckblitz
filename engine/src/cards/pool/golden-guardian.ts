import { defineCard } from "../define.js";

const FIGHT_TEXT =
  "{2}: This creature fights another target creature you control. When this creature dies this turn, return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Golden Guardian",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${FIGHT_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control", than: "source" }],
      // The fight, then the watch on this creature (Cryptek's delayed
      // return): "When this creature dies this turn" is a leave watch on the
      // source, set up only while it's still on the battlefield (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "fight", a: "source", b: 0 },
          {
            kind: "delayed-trigger",
            at: { leaves: "source", to: ["graveyard"], thisTurn: true },
            effect: { kind: "put-onto-battlefield", target: "trigger-object", transformed: true, underYourControl: true },
            text: "When this creature dies this turn, return it to the battlefield transformed under your control.",
          },
        ],
      },
      resolve: null,
      text: FIGHT_TEXT,
    },
  ],
  faces: ["Golden Guardian", "Gold-Forge Garrison"],
  transform: true,
});
