/**
 * Tempest (TMP; B178), group E. One test per card whose behaviour is more
 * than a stat line or an exact copy of an already-tested pattern, on the
 * clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("TMP group E", () => {
  it("Jinxed Idol: sacrificing a creature gives it to the target opponent, who then takes its upkeep damage", () => {
    const { game } = table();
    const idol = spawn(game, "Jinxed Idol");
    const fodder = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: idol, abilityIndex: 0, targets: [ref(B)], sacrifice: fodder });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(controller(game, idol)).toBe(B);
    nextTurn(game); // bob's turn: his upkeep
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("Puppet Strings: untaps a tapped creature", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const strings = spawn(game, "Puppet Strings");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickModes(a, 1);
    activate(game, strings, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("Sadistic Glee: any creature dying grows the enchanted creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(mine)];
    cast(game, toHand(game, "Sadistic Glee"), { targets: [ref(mine)] });
    destroy(game, theirs);
    expect(counters(game, mine)).toBe(1);
  });

  it("Helm of Possession: control lasts while it stays tapped", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const helm = spawn(game, "Helm of Possession");
    const fodder = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Hill Giant", B);
    game.dispatch({ type: "activate-ability", player: A, source: helm, abilityIndex: 0, targets: [ref(target)], sacrifice: fodder });
    settle(game);
    expect(controller(game, target)).toBe(A);
    pickPermanents(a, helm); // kept tapped through alice's next untap step
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, target)).toBe(A);
    pickPermanents(a); // let it untap: the Giant goes back
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, target)).toBe(B);
  });

  it("Dregs of Sorrow: destroys X nonblack creatures and draws X", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Dregs of Sorrow"), { x: 2, targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });

  it("Legacy's Allure: steals a creature with power up to its treasure counters, read after the sacrifice", () => {
    const { game } = table();
    const allure = spawn(game, "Legacy's Allure");
    game.state.objects[allure].counters.treasure = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, allure, 0, { targets: [ref(bears)] });
    expect(zone(game, allure)).toBe("graveyard");
    expect(controller(game, bears)).toBe(A);
  });

  it("Legacy's Allure: a creature with more power than its counters can't be targeted", () => {
    const { game } = table();
    const allure = spawn(game, "Legacy's Allure");
    game.state.objects[allure].counters.treasure = 2;
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, allure, 0, { targets: [ref(giant)] })).toThrow();
  });

  it("Death Pits of Rath: a creature dealt damage is destroyed", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Death Pits of Rath");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Carrionette: unpaid, it and the target are exiled", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    lands(game, "Wastes", 2, B);
    const skeleton = toGraveyard(game, "Carrionette");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    activate(game, skeleton, 0, { targets: [ref(bears)] });
    expect(zone(game, skeleton)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
  });

  it("Carrionette: paid, neither is exiled", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    lands(game, "Wastes", 2, B);
    const skeleton = toGraveyard(game, "Carrionette");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    activate(game, skeleton, 0, { targets: [ref(bears)] });
    expect(zone(game, skeleton)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Rats of Rath: can target only your own permanents", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const rats = spawn(game, "Rats of Rath");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, rats, 0, { targets: [ref(theirs)] })).toThrow();
    const mine = spawn(game, "Grizzly Bears");
    activate(game, rats, 0, { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});
