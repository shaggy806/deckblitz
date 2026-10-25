/**
 * Batch 157, group D — Commander 2014 and Khans of Tarkir: the clauses most
 * likely to be wrong on each card.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  nextTurn,
  zone,
} from "./harness.js";

describe("Wave of Vitriol", () => {
  it("sacrifices artifacts, enchantments and nonbasic lands; only a player who lost lands searches", () => {
    const { game, a, b } = table();
    const forests = lands(game, "Forest", 7);
    const tower = spawn(game, "Command Tower");
    const ring = spawn(game, "Sol Ring");
    const swamp = spawn(game, "Swamp", B);
    const wave = toHand(game, "Wave of Vitriol");
    pickModes(a, 0);
    pickModes(b, 0);
    const basic = game.state.zones.perPlayer[A].library[0];
    const aSearch = pickFromZone(a, basic);
    const bSearch = pickFromZone(b);
    cast(game, wave);
    expect(zone(game, tower)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(forests.every((f) => zone(game, f) === "battlefield")).toBe(true);
    expect(zone(game, swamp)).toBe("battlefield");
    expect(aSearch.offered.length).toBeGreaterThan(0);
    expect(zone(game, basic)).toBe("battlefield");
    expect(game.state.objects[basic].tapped).toBe(true);
    // Bob sacrificed no land: nothing to search for.
    expect(bSearch.offered).toEqual([]);
  });
});

describe("Rakshasa Vizier", () => {
  it("gets one counter per card delve exiled, in one trigger", () => {
    const { game } = table();
    const vizier = spawn(game, "Rakshasa Vizier");
    const victim = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    const yard = [toGraveyard(game, "Forest"), toGraveyard(game, "Forest"), toGraveyard(game, "Forest")];
    const cut = toHand(game, "Murderous Cut");
    cast(game, cut, { targets: [ref(victim)], delve: yard });
    expect(zone(game, victim)).toBe("graveyard");
    expect(counters(game, vizier)).toBe(3);
  });
});

describe("Savage Punch", () => {
  it("pumps before the fight only with ferocious", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Savage Punch"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");

    spawn(game, "Serra Angel");
    const bears2 = spawn(game, "Grizzly Bears");
    const giant2 = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Savage Punch"), { targets: [ref(bears2), ref(giant2)] });
    expect(zone(game, giant2)).toBe("graveyard");
    expect(zone(game, bears2)).toBe("battlefield");
    expect(pt(game, bears2)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Mindswipe", () => {
  it("deals X damage to the spell's controller after countering it", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickModes(a);
    cast(game, toHand(game, "Mindswipe"), { targets: [ref(bears)], x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });
});

describe("Angel of the Dire Hour", () => {
  it("cast from hand during combat, exiles every attacking creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 7);
    const bears = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Angel of the Dire Hour"));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, home)).toBe("battlefield");
  });
});

describe("Ivorytusk Fortress", () => {
  it("untaps creatures with +1/+1 counters during another player's untap step", () => {
    const { game } = table();
    spawn(game, "Ivorytusk Fortress");
    const marked = spawn(game, "Grizzly Bears", A, { tapped: true });
    game.state.objects[marked].counters["+1/+1"] = 1;
    const plain = spawn(game, "Hill Giant", A, { tapped: true });
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(game.state.objects[marked].tapped).toBe(false);
    expect(game.state.objects[plain].tapped).toBe(true);
  });
});

describe("Ghostfire Blade", () => {
  it("equips a colorless creature for {1}", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const blade = spawn(game, "Ghostfire Blade");
    const thopter = spawn(game, "Ornithopter");
    activate(game, blade, 0, { targets: [ref(thopter)] });
    expect(pt(game, thopter)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Pine Walker", () => {
  it("untaps itself as it's turned face up", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const walker = toHand(game, "Pine Walker");
    cast(game, walker, { via: "face-down" });
    game.state.objects[walker].tapped = true;
    game.dispatch({ type: "turn-face-up", player: A, permanent: walker, morph: true } as Action);
    settle(game);
    expect(game.state.objects[walker].faceDown).toBeUndefined();
    expect(game.state.objects[walker].tapped).toBe(false);
  });
});

describe("Nahiri, the Lithomancer", () => {
  it("−10 makes Stoneforged Blade; −2 puts an Equipment from the graveyard onto the battlefield", () => {
    const { game, a } = table();
    const nahiri = spawn(game, "Nahiri, the Lithomancer");
    loyalty(game, nahiri, -10, { atLeast: 13 });
    const [blade] = named(game, "Stoneforged Blade Token", A);
    expect(blade).toBeDefined();
    expect(game.state.objects[blade].zone).toBe("battlefield");

    nextTurn(game);
    nextTurn(game);
    const ghostfire = toGraveyard(game, "Ghostfire Blade");
    pickModes(a, 0);
    pickFromZone(a, ghostfire);
    loyalty(game, nahiri, -2, { atLeast: 2 });
    expect(zone(game, ghostfire)).toBe("battlefield");
    expect(graveyard(game, A)).not.toContain(ghostfire);
  });
});
