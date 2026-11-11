import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const TEXT =
  'Whenever a nontoken creature an opponent controls dies, you may pay {1}. If you do, return that card to the battlefield tapped under your control. It\'s a Treasure artifact with "{T}, Sacrifice this artifact: Add one mana of any color," and it loses all other card types.';

export default defineCard({
  name: "Vraska, the Silencer",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "opponent", filter: { type: "creature", token: false } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to return that card to the battlefield as a Treasure under your control?",
        cost: "{1}",
        effect: {
          kind: "put-onto-battlefield",
          target: "trigger-object",
          underYourControl: true,
          enterTapped: true,
          // Only a Treasure artifact (its ruling): its other card types and
          // subtypes go, its supertypes and abilities stay.
          setTypes: ["artifact"],
          enterAs: {
            setSubtypes: ["Treasure"],
            activated: [
              addManaAbility({
                mana: "any-color",
                sacrifice: "self",
                text: "{T}, Sacrifice this artifact: Add one mana of any color.",
              }),
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
