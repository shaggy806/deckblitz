import { roomCard } from "../helpers.js";
import left from "./derelict-attic.js";
import right from "./widows-walk.js";

// EDHREC rank 8401. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a
// sorcery.
export default roomCard("Derelict Attic // Widow's Walk", left, right);
