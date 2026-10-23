import { defineCard } from "../define.js";

const TEXT =
  "Whenever Amy Rose attacks, attach up to one target Equipment to her. Then up to one other target attacking creature gets +X/+0 until end of turn, where X is Amy Rose's power.";

// X is Amy's power as the trigger resolves — after the Equipment is attached.
export default defineCard({
  name: "Amy Rose",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hedgehog", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "permanent", filter: { subtype: "Equipment" } } },
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: "source", attachment: 0 },
          {
            kind: "modify-pt",
            target: 1,
            power: { powerOf: "source" },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
