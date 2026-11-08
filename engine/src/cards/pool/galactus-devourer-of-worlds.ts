import { defineCard } from "../define.js";

// "Attacks an opponent with the most life": one requirement obeyed by attacking
// any such opponent (rule 508.1d), so two tied leave a free choice; a planeswalker
// of theirs doesn't obey it.
const ENTERS_TEXT = "When Galactus enters, exile target permanent.";
const HUNGER_TEXT =
  "Insatiable Hunger \u2014 Galactus attacks an opponent with the most life among your opponents each combat if able unless you control a creature named Silver Surfer, Galactus's Herald.";

export default defineCard({
  name: "Galactus, Devourer of Worlds",
  manaCost: "{10}",
  colors: [],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elder", "Alien"],
  power: 12,
  toughness: 12,
  keywords: ["flying", "trample", "indestructible"],
  text: "Flying, trample, indestructible\n" + ENTERS_TEXT + "\n" + HUNGER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature", name: "Silver Surfer, Galactus's Herald" }, atLeast: 1 } },
      restrictions: [{ kind: "must-attack", at: { defender: { mostLifeAmongYourOpponents: true } } }],
      text: HUNGER_TEXT,
    },
  ],
});
