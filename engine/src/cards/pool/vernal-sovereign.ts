import { defineCard } from "../define.js";

// EDHREC rank 8310. Fallout (PIP). "Enters or attacks" is two triggers.
const TEXT =
  "Whenever this creature enters or attacks, create a green and white Elemental creature token with \"This token's power and toughness are each equal to the number of creatures you control.\"";
const MAKE = { kind: "create-token", token: "Elemental Token (Vernal Sovereign)", count: 1 } as const;

export default defineCard({
  name: "Vernal Sovereign",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental", "Elk"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MAKE, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MAKE, resolve: null, text: TEXT },
  ],
});
