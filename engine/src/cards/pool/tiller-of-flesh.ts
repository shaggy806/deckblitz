import { defineCard } from "../define.js";

// EDHREC rank 15922.

const TEXT = "Whenever you cast a spell that targets one or more permanents, incubate 2.";

export default defineCard({
  name: "Tiller of Flesh",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 2,
  toughness: 4,
  text: `${TEXT} (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { permanent: {} } } },
      targets: [],
      effect: { kind: "incubate", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
