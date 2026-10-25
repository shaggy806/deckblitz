import { describe, expect, it } from "vitest";
import { phasedOutIds } from "../state.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  spawn,
  toHand,
  toStep,
  zone,
  table,
} from "./harness.js";

describe("Mirage batch 1, group E", () => {
  it("Builder's Bane deals each player damage for the artifacts they controlled that went to a graveyard", () => {
    const { game } = table();
    const mine = spawn(game, "Mind Stone", A);
    const theirs1 = spawn(game, "Sol Ring", B);
    const theirs2 = spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Builder's Bane"), { x: 3, targets: [ref(mine), ref(theirs1), ref(theirs2)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs1)).toBe("graveyard");
    expect(zone(game, theirs2)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });

  it("Grim Feast gains life for an opponent's creature dying, not its controller's own", () => {
    const { game } = table();
    spawn(game, "Grim Feast", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, theirs);
    expect(life(game, A)).toBe(22);
    destroy(game, mine);
    expect(life(game, A)).toBe(22);
  });

  it("Agility grants +1/+1 and a working flanking trigger", () => {
    const { game, a, b } = table();
    const attacker = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 2);
    pickTargets(a, attacker);
    cast(game, toHand(game, "Agility"), { targets: [ref(attacker)] });
    expect(pt(game, attacker)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, attacker).has("flanking")).toBe(true);
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker }];
    attack(game, a, [attacker]);
    // The blocker fought as a 1/1: one damage on the attacker, not two.
    expect(zone(game, blocker)).toBe("graveyard");
    expect(game.state.objects[attacker].damageMarked).toBe(1);
  });

  it("Binding Agony deals the damage dealt to the enchanted creature to its controller", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Binding Agony"), { targets: [ref(bears)] });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("Aleatory can't be cast outside combat", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", A);
    expect(() => cast(game, toHand(game, "Aleatory"), { targets: [ref(bears)] })).toThrow(/refused/);
  });

  it("Harbinger of Night puts a -1/-1 counter on each creature at its controller's upkeep", () => {
    const { game } = table();
    const harbinger = spawn(game, "Harbinger of Night", A);
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "draw");
    expect(counters(game, harbinger, "-1/-1")).toBe(1);
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });

  it("Taniwha phases out its controller's lands at upkeep, not the opponent's", () => {
    const { game } = table();
    const taniwha = spawn(game, "Taniwha", A);
    const mine = lands(game, "Island", 2);
    const theirs = lands(game, "Island", 1, B);
    // Alice's next untap step phases Taniwha itself out (no trigger that
    // upkeep, lands untouched); the one after phases it back in.
    toStep(game, "draw");
    expect(phasedOutIds(game.state)).toEqual([taniwha]);
    toStep(game, "draw");
    const out = phasedOutIds(game.state);
    expect(out).not.toContain(taniwha);
    for (const id of mine) expect(out).toContain(id);
    for (const id of theirs) expect(out).not.toContain(id);
  });
});
