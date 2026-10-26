/**
 * Betrayers of Kamigawa / Champions of Kamigawa (B207) — group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Waxmane Baku", () => {
  it("takes a ki counter for a Spirit spell, then taps X target creatures for X counters", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const baku = spawn(game, "Waxmane Baku");
    lands(game, "Plains", 7);
    cast(game, toHand(game, "Waxmane Baku"));
    cast(game, toHand(game, "Waxmane Baku"));
    expect(counters(game, baku, "ki")).toBe(2);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    activate(game, baku, 0, { x: 2, targets: [ref(one), ref(two)] });
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
    expect(counters(game, baku, "ki")).toBe(0);
  });
});

describe("Clash of Realities", () => {
  it("gives an entering Spirit a shot at a non-Spirit creature, and a non-Spirit one at a Spirit", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Clash of Realities");
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Waxmane Baku");
    expect(zone(game, bears)).toBe("graveyard");
    const theirBaku = spawn(game, "Waxmane Baku", B);
    pickTargets(a, theirBaku);
    enter(game, "Hill Giant");
    expect(zone(game, theirBaku)).toBe("graveyard");
  });
});

describe("Akki Raider", () => {
  it("gets +1/+0 whenever any land goes to a graveyard from the battlefield", () => {
    const { game } = table();
    const raider = spawn(game, "Akki Raider");
    const [land] = lands(game, "Forest", 1, B);
    destroy(game, land);
    expect(pt(game, raider)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Sensei Golden-Tail", () => {
  it("trains a creature: a training counter, bushido 1 and the Samurai type", () => {
    const { game, a, b } = table();
    const sensei = spawn(game, "Sensei Golden-Tail");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, sensei, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "training")).toBe(1);
    expect(subtypes(game, bears)).toContain("Samurai");
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Devouring Greed", () => {
  it("drains 2 plus 2 for each Spirit sacrificed as it's cast", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const spirits = [spawn(game, "Waxmane Baku"), spawn(game, "Waxmane Baku")];
    cast(game, toHand(game, "Devouring Greed"), { x: 2, targets: [ref(B)] });
    expect(spirits.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(26);
  });

  it("with no Spirit sacrificed, drains 2", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Devouring Greed"), { x: 0, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Iname, Death Aspect", () => {
  it("puts any number of Spirit cards from the library into the graveyard", () => {
    const { game, a } = table();
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    const found = [toLibrary(game, "Waxmane Baku"), toLibrary(game, "Waxmane Baku")];
    const before = graveyard(game).length;
    enter(game, "Iname, Death Aspect");
    expect(found.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(graveyard(game).length).toBe(before + 2);
  });
});

describe("Ornate Kanzashi", () => {
  it("exiles the top card of the target opponent's library", () => {
    const { game } = table();
    const kanzashi = spawn(game, "Ornate Kanzashi");
    lands(game, "Wastes", 2);
    const top = toLibrary(game, "Grizzly Bears", B);
    activate(game, kanzashi, 0, { targets: [ref(B)] });
    expect(zone(game, top)).toBe("exile");
  });
});
