import { defineCard } from "../define.js";

const ENTER_TEXT =
  'When Thousand Moons Smithy enters, create a white Gnome Soldier artifact creature token with "This token\'s power and toughness are each equal to the number of artifacts and/or creatures you control."';
const TRANSFORM_TEXT =
  "At the beginning of your first main phase, you may tap five untapped artifacts and/or creatures you control. If you do, transform Thousand Moons Smithy.";

const UNTAPPED = { typesAnyOf: ["artifact", "creature"], tapped: false, controlledBy: "you" } as const;

// Tapping five is a cost paid as the ability resolves: offered only with five to
// tap, all five or nothing. The Smithy itself may be one of them.
export default defineCard({
  name: "Thousand Moons Smithy",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Soldier Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: UNTAPPED, atLeast: 5 },
        then: {
          kind: "may",
          prompt: "Tap five untapped artifacts and/or creatures you control to transform Thousand Moons Smithy?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "choose-permanents",
                filter: UNTAPPED,
                min: 5,
                upTo: 5,
                then: { kind: "tap", target: 0 },
                prompt: "Tap five untapped artifacts and/or creatures you control",
              },
              { kind: "transform", target: "source" },
            ],
          },
        },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Thousand Moons Smithy", "Barracks of the Thousand"],
  transform: true,
});
