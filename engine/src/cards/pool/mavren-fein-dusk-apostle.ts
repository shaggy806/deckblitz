import { defineCard } from "../define.js";

// EDHREC rank 3852. One token per attack, however many nontoken Vampires
// attack (a batched attack trigger).

export default defineCard({
  name: "Mavren Fein, Dusk Apostle",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Whenever one or more nontoken Vampires you control attack, create a 1/1 white Vampire creature token with lifelink.",
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Vampire", token: false, controlledBy: "you" } },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Vampire Token", count: 1 },
      resolve: null,
      text: "Whenever one or more nontoken Vampires you control attack, create a 1/1 white Vampire creature token with lifelink.",
    },
  ],
});
