import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloudgoat Ranger",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior", "Ranger"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, create three 1/1 white Kithkin Soldier creature tokens.\nTap three untapped Kithkin you control: This creature gets +2/+0 and gains flying until end of turn.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 3, filter: { subtype: "Kithkin", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "flying",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Tap three untapped Kithkin you control: This creature gets +2/+0 and gains flying until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Soldier Token", count: 3 },
      resolve: null,
      text: "When this creature enters, create three 1/1 white Kithkin Soldier creature tokens.",
    },
  ],
});
