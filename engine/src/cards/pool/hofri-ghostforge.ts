import { defineCard } from "../define.js";

const LORD = "Spirits you control get +1/+1 and have trample and haste.";
const RETURN_TEXT = "When this token leaves the battlefield, return the exiled card to its owner's graveyard.";
const TRIGGER_TEXT = `Whenever another nontoken creature you control dies, exile it. If you do, create a token that's a copy of that creature, except it's a Spirit in addition to its other types and it has "${RETURN_TEXT}"`;

export default defineCard({
  name: "Hofri Ghostforge",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 4,
  toughness: 5,
  text: `${LORD}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Spirit", controlledBy: "you" } },
      grantPt: [1, 1],
      grantKeywords: ["trample", "haste"],
      text: LORD,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", otherOnly: true, filter: { type: "creature", token: false } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "sequence",
              effects: [
                {
                  // As it last existed on the battlefield, not the card in
                  // exile (the ruling): a copy's default.
                  kind: "create-token-copy",
                  of: "trigger-object",
                  count: 1,
                  who: "you",
                  exceptions: {
                    addSubtypes: ["Spirit"],
                    triggered: [
                      {
                        trigger: { on: "leaves-battlefield", who: "self" },
                        targets: [],
                        effect: { kind: "return-exiled-by-source", linked: "graveyard" },
                        resolve: null,
                        text: RETURN_TEXT,
                      },
                    ],
                  },
                },
                { kind: "link-exiled-to-created" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
