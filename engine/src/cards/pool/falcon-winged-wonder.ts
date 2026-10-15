import { defineCard } from "../define.js";

// EDHREC rank 24402. Redwing is a named legendary token keyed by its own name.
const ETB_TEXT =
  "Avian Telepathy — When Falcon enters, create Redwing, a legendary 1/1 blue Bird Scout creature token with flying and \"Whenever Redwing attacks, surveil 1.\"";

export default defineCard({
  name: "Falcon, Winged Wonder",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Redwing", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
