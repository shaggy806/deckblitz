import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a Spirit or Arcane spell, create a 3/3 white Spirit creature token with flying.";

export default defineCard({
  name: "Oyobi, Who Split the Heavens",
  manaCost: "{6}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White 3/3 Flying)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
