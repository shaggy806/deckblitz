import { defineCard } from "../define.js";

// A white Avatar whose power and toughness are each its controller's life
// total (Ajani Goldmane's −6) — a characteristic-defining ability (604.3).
export default defineCard({
  name: "Avatar Token",
  art: "863768b5-3cf9-415c-b4fd-371dc5afee18",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  text: "This creature's power and toughness are each equal to your life total.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "your-life-total", plusPower: 0, plusToughness: 0 },
      text: "This creature's power and toughness are each equal to your life total.",
    },
  ],
});
