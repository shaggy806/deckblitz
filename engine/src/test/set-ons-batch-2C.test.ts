/**
 * Onslaught (ONS; B230), group C. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  hand,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("ONS group C (B230)", () => {
  it("Skirk Commando: combat damage to a player lets it deal 2 to a creature that player controls", () => {
    const { game, a } = table();
    const commando = spawn(game, "Skirk Commando");
    const victim = spawn(game, "Daru Cavalier", B);
    pickTargets(a, victim);
    pickModes(a, 0);
    attack(game, a, [commando]);
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Run Wild: the creature gains trample and a {G} regeneration that saves it", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bear = spawn(game, "Daru Cavalier");
    cast(game, toHand(game, "Run Wild"), { targets: [ref(bear)] });
    activate(game, bear, 0);
    destroy(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("Withering Hex: each cycle by any player puts a plague counter and shrinks the creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Island", 6);
    const target = spawn(game, "Gustcloak Sentinel", B);
    const hex = toHand(game, "Withering Hex");
    cast(game, hex, { targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 3, toughness: 3 });
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Essence Fracture") });
    settle(game);
    expect(game.state.objects[hex].counters.plague).toBe(1);
    expect(pt(game, target)).toEqual({ power: 2, toughness: 2 });
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Essence Fracture") });
    settle(game);
    expect(pt(game, target)).toEqual({ power: 1, toughness: 1 });
  });

  it("Piety Charm: the Soldier mode pumps a Soldier by +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const soldier = spawn(game, "Daru Cavalier");
    cast(game, toHand(game, "Piety Charm"), { modes: [1], targets: [ref(soldier)] });
    expect(pt(game, soldier)).toEqual({ power: 4, toughness: 4 });
  });

  it("Avarax: entering may fetch another Avarax to hand", () => {
    const { game, a } = table();
    const other = toLibrary(game, "Avarax");
    pickModes(a, 0);
    pickFromZone(a, other);
    const before = hand(game).length;
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Avarax"));
    expect(zone(game, other)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });
});
